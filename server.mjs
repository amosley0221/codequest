import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const root = process.cwd();
const preferredPort = Number(process.env.PORT || 5173);
const host = process.env.HOST || (process.env.PORT ? "0.0.0.0" : "127.0.0.1");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function makeServer() {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
      const pathname = decodeURIComponent(url.pathname);
      let filePath = resolve(join(root, pathname));

      if (!filePath.startsWith(root)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }

      const fileStat = await stat(filePath).catch(() => null);
      if (fileStat?.isDirectory()) {
        filePath = join(filePath, "index.html");
      }

      const content = await readFile(filePath);
      const type = mimeTypes[extname(filePath)] || "application/octet-stream";
      const baseName = filePath.split("/").pop();
      const cacheControl = baseName === "index.html" || baseName === "service-worker.js"
        ? "no-cache"
        : "public, max-age=3600";
      response.writeHead(200, {
        "Content-Type": type,
        "Cache-Control": cacheControl
      });
      response.end(content);
    } catch (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  });
}

function listen(port, attemptsLeft = 10) {
  const server = makeServer();

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && attemptsLeft > 0) {
      listen(port + 1, attemptsLeft - 1);
      return;
    }
    throw error;
  });

  server.listen(port, host, () => {
    const displayHost = host === "0.0.0.0" ? "localhost" : host;
    console.log(`Code Quest running at http://${displayHost}:${port}`);
  });
}

listen(preferredPort);
