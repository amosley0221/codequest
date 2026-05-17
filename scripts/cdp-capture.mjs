import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9339;
const outputDir = new URL("../screenshots/", import.meta.url);
const url = process.argv[2] || "http://127.0.0.1:5173/";
const mode = process.argv[3] || "desktop";
const action = process.argv[4] || "";

const viewports = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
  wide: { width: 2560, height: 900, deviceScaleFactor: 1, mobile: false },
  tablet: { width: 900, height: 1180, deviceScaleFactor: 1, mobile: false },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }
};

const viewport = viewports[mode] || viewports.desktop;
const profileDir = await mkdtemp(join(tmpdir(), "codequest-chrome-"));
await mkdir(outputDir, { recursive: true });

const chrome = spawn(chromePath, [
  "--headless=new",
  "--ignore-gpu-blocklist",
  "--enable-unsafe-swiftshader",
  "--use-angle=swiftshader",
  "--disable-background-networking",
  "--disable-default-apps",
  "--disable-extensions",
  "--disable-sync",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profileDir}`,
  "about:blank"
], {
  stdio: ["ignore", "pipe", "pipe"]
});

const chromeErrors = [];
chrome.stderr.on("data", (chunk) => {
  const text = chunk.toString();
  if (/Uncaught|ERROR|TypeError|ReferenceError|SyntaxError|WebGL/i.test(text)) {
    chromeErrors.push(text.trim());
  }
});

try {
  const wsUrl = await waitForDebuggerUrl(port);
  const client = await makeCdpClient(wsUrl);
  const issues = [];

  client.onMessage((message) => {
    if (message.method === "Runtime.exceptionThrown") {
      const details = message.params.exceptionDetails;
      issues.push(`${details.text}: ${details.exception?.description || ""}`.trim());
    }
    if (message.method === "Log.entryAdded") {
      const entry = message.params.entry;
      if (entry.level === "error") {
        issues.push(entry.text);
      }
    }
  });

  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Log.enable");
  await client.send("Emulation.setDeviceMetricsOverride", viewport);
  await client.send("Page.navigate", { url });
  await delay(3800);

  if (action === "click-html") {
    await client.send("Runtime.evaluate", {
      expression: `document.querySelector(".realm-html button")?.click()`,
      returnByValue: true
    });
    await delay(2200);
  } else if (action === "walk-css") {
    await client.send("Runtime.evaluate", {
      expression: `(() => {
        const key = "code-quest-language-realms-v5";
        const saved = JSON.parse(localStorage.getItem(key) || "{}");
        localStorage.setItem(key, JSON.stringify({
          ...saved,
          xp: Math.max(1000, saved.xp || 0),
          activeNode: "html",
          activeActivity: "lessons",
          activeItemId: "html-lesson-tags"
        }));
        location.reload();
      })()`,
      returnByValue: true
    });
    await delay(900);
    await client.send("Runtime.evaluate", {
      expression: `document.querySelector(".realm-css button")?.click()`,
      returnByValue: true
    });
    await delay(2600);
  } else if (action === "scroll-left-panel") {
    await client.send("Runtime.evaluate", {
      expression: `document.querySelector(".left-panel")?.scrollIntoView({ block: "start" })`,
      returnByValue: true
    });
    await delay(700);
  }

  const readiness = await client.send("Runtime.evaluate", {
    expression: `({
      title: document.querySelector("#selectedTitle")?.textContent,
      challenges: document.querySelector("#challengeList")?.children.length,
      lessons: document.querySelector("#lessonList")?.children.length,
      editorLength: document.querySelector("#codeEditor")?.value.length,
      heroLeft: document.querySelector("#mapHero")?.style.left,
      heroTop: document.querySelector("#mapHero")?.style.top,
      heroClass: document.querySelector("#mapHero")?.className,
      stars: document.querySelector("#liveStars")?.children.length,
      effects: document.querySelector("#mapEffects")?.children.length,
      gsap: typeof window.gsap,
      pwa: {
        manifest: document.querySelector('link[rel="manifest"]')?.getAttribute("href") || null,
        serviceWorker: "serviceWorker" in navigator
      },
      map: (() => {
        const world = document.querySelector("#worldMap");
        const art = document.querySelector("#mapArt");
        return world && art ? {
          worldWidth: Math.round(world.getBoundingClientRect().width),
          worldHeight: Math.round(world.getBoundingClientRect().height),
          artWidth: Math.round(art.getBoundingClientRect().width),
          artHeight: Math.round(art.getBoundingClientRect().height),
          scrollLeft: Math.round(world.scrollLeft)
        } : null;
      })(),
      canvas: (() => {
        const canvas = document.querySelector("#gameCanvas");
        return canvas ? { width: canvas.width, height: canvas.height } : null;
      })()
    })`,
    returnByValue: true
  });

  const screenshot = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false
  });
  const filePath = new URL(`code-quest-${mode}.png`, outputDir);
  await writeFile(filePath, Buffer.from(screenshot.data, "base64"));

  console.log(JSON.stringify({
    file: filePath.pathname,
    readiness: readiness.result.value,
    issues,
    chromeErrors
  }, null, 2));

  await client.close();
} finally {
  chrome.kill("SIGTERM");
  await delay(300);
  await rm(profileDir, { recursive: true, force: true }).catch(() => {});
}

async function waitForDebuggerUrl(debugPort) {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    try {
      const targets = await getJson(`http://127.0.0.1:${debugPort}/json`);
      const page = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
      if (page) {
        return page.webSocketDebuggerUrl;
      }
    } catch {
      await delay(120);
    }
  }
  throw new Error("Chrome DevTools endpoint did not become available.");
}

function getJson(endpoint) {
  return fetch(endpoint).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  });
}

function makeCdpClient(wsUrl) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(wsUrl);
    const pending = new Map();
    const listeners = new Set();
    let id = 0;

    socket.addEventListener("open", () => {
      resolve({
        send(method, params = {}) {
          id += 1;
          const messageId = id;
          socket.send(JSON.stringify({ id: messageId, method, params }));
          return new Promise((sendResolve, sendReject) => {
            pending.set(messageId, { resolve: sendResolve, reject: sendReject });
          });
        },
        onMessage(listener) {
          listeners.add(listener);
        },
        close() {
          return new Promise((closeResolve) => {
            socket.addEventListener("close", closeResolve, { once: true });
            socket.close();
          });
        }
      });
    });

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data.toString());
      if (message.id && pending.has(message.id)) {
        const deferred = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) {
          deferred.reject(new Error(message.error.message));
        } else {
          deferred.resolve(message.result);
        }
        return;
      }
      for (const listener of listeners) {
        listener(message);
      }
    });

    socket.addEventListener("error", reject, { once: true });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
