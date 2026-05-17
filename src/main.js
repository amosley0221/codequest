(function () {
const { evaluateChallenge, getActivities, getActivity, getChallenge, getNode, languageNodes } = window.CodeQuestData;

const STORAGE_KEY = "code-quest-language-realms-v5";
const XP_PER_LEVEL = 1000;
const activityKinds = ["lessons", "challenges", "projects", "quizzes"];
const finalRealm = {
  id: "final",
  order: "★",
  title: "FINAL QUEST",
  realm: "Boss Castle",
  short: "Full Stack Project",
  description: "Build your own full stack project.",
  accent: "#d86bff",
  unlockXp: 6000,
  challenges: []
};

const mapNodes = [...languageNodes, finalRealm];
const state = loadState();
let activeActivity = null;
let displayedHeroNode = state.activeNode;
let heroTargetNode = state.activeNode;
let heroAnimationId = 0;
let heroTimeline = null;
let lastPulsedNode = "";
let lastMobileCenter = 0;

const dom = {
  levelLabel: document.querySelector("#levelLabel"),
  xpLabel: document.querySelector("#xpLabel"),
  xpMeter: document.querySelector("#xpMeter"),
  streakValue: document.querySelector("#streakValue"),
  pointValue: document.querySelector("#pointValue"),
  gemValue: document.querySelector("#gemValue"),
  gemTopValue: document.querySelector("#gemTopValue"),
  badgeValue: document.querySelector("#badgeValue"),
  questValue: document.querySelector("#questValue"),
  badgeRow: document.querySelector("#badgeRow"),
  dailyProgress: document.querySelector("#dailyProgress"),
  dailyMeter: document.querySelector("#dailyMeter"),
  roadmapTitle: document.querySelector("#roadmapTitle"),
  activityTitle: document.querySelector("#activityTitle"),
  worldMap: document.querySelector("#worldMap"),
  mapArt: document.querySelector("#mapArt"),
  liveStars: document.querySelector("#liveStars"),
  mapEffects: document.querySelector("#mapEffects"),
  realmLayer: document.querySelector("#realmLayer"),
  mapHero: document.querySelector("#mapHero"),
  resetViewButton: document.querySelector("#resetViewButton"),
  focusChallengeButton: document.querySelector("#focusChallengeButton"),
  challengeList: document.querySelector("#challengeList"),
  challengeCount: document.querySelector("#challengeCount"),
  arena: document.querySelector("#arena"),
  arenaLanguage: document.querySelector("#arenaLanguage"),
  arenaPrompt: document.querySelector("#arenaPrompt"),
  codeEditor: document.querySelector("#codeEditor"),
  runButton: document.querySelector("#runButton"),
  hintButton: document.querySelector("#hintButton"),
  resetCodeButton: document.querySelector("#resetCodeButton"),
  outputPanel: document.querySelector("#outputPanel")
};

dom.activityButtons = Array.from(document.querySelectorAll("[data-activity]"));

const nodeLayout = {
  html: { left: 26, top: 29 },
  css: { left: 50, top: 30 },
  javascript: { left: 74, top: 30 },
  python: { left: 30, top: 60 },
  sql: { left: 58, top: 58 },
  react: { left: 40, top: 79 },
  final: { left: 78, top: 72 }
};

const heroLayout = {
  html: { left: 33, top: 44 },
  css: { left: 50, top: 43 },
  javascript: { left: 71, top: 43 },
  python: { left: 30, top: 70 },
  sql: { left: 57, top: 69 },
  react: { left: 41, top: 88 },
  final: { left: 76, top: 83 }
};

const routeGraph = {
  html: {
    css: [{ left: 40, top: 43 }]
  },
  css: {
    html: [{ left: 40, top: 43 }],
    javascript: [{ left: 59, top: 43 }, { left: 64, top: 43 }],
    python: [{ left: 48, top: 47 }, { left: 41, top: 56 }, { left: 34, top: 64 }],
    sql: [{ left: 52, top: 48 }, { left: 57, top: 57 }]
  },
  javascript: {
    css: [{ left: 64, top: 43 }, { left: 59, top: 43 }],
    sql: [{ left: 66, top: 50 }, { left: 61, top: 58 }]
  },
  python: {
    css: [{ left: 34, top: 64 }, { left: 41, top: 56 }, { left: 48, top: 47 }],
    react: [{ left: 31, top: 75 }, { left: 37, top: 83 }],
    sql: [{ left: 39, top: 65 }, { left: 51, top: 61 }]
  },
  sql: {
    css: [{ left: 57, top: 57 }, { left: 52, top: 48 }],
    javascript: [{ left: 61, top: 58 }, { left: 66, top: 50 }],
    python: [{ left: 51, top: 61 }, { left: 39, top: 65 }],
    react: [{ left: 54, top: 70 }, { left: 47, top: 81 }],
    final: [{ left: 65, top: 68 }, { left: 72, top: 79 }]
  },
  react: {
    python: [{ left: 37, top: 83 }, { left: 31, top: 75 }],
    sql: [{ left: 47, top: 81 }, { left: 54, top: 70 }]
  },
  final: {
    sql: [{ left: 72, top: 79 }, { left: 65, top: 68 }]
  }
};

const starColors = ["#ffffff", "#6eefff", "#ffe59d", "#9bb7ff", "#d884ff"];
const starCount = 86;

const propsByNode = {
  html: [
    ["tree", 34, 18],
    ["tree", 105, 18],
    ["tree", 130, 49],
    ["house", 68, 46]
  ],
  css: [
    ["tree", 38, 25],
    ["crystal", 92, 18],
    ["crystal", 122, 45]
  ],
  javascript: [
    ["castle", 72, 25],
    ["castle", 114, 42]
  ],
  python: [
    ["crystal", 36, 38],
    ["tower", 82, 22],
    ["crystal", 132, 44]
  ],
  sql: [
    ["blocks", 64, 20],
    ["crystal", 122, 48]
  ],
  react: [
    ["blocks", 54, 34],
    ["crystal", 120, 30]
  ],
  final: [["final-gate", 62, 14]]
};

bindEvents();
setupLiveStars();
setupAmbientMotion();
renderAll();
loadActivity(state.activeActivity, state.activeItemId, { quiet: true });

function loadState() {
  const fallback = {
    xp: 0,
    gems: 0,
    streak: 0,
    dailyCompleted: 0,
    activeNode: "html",
    activeActivity: "lessons",
    activeItemId: "html-lesson-tags",
    activeChallenge: "html-heading-paragraph",
    completedActivities: createEmptyCompletedActivities(),
    editorDrafts: {}
  };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || typeof saved !== "object") {
      return fallback;
    }
    return {
      ...fallback,
      ...saved,
      completedActivities: mergeCompletedActivities(saved.completedActivities),
      editorDrafts: { ...(saved.editorDrafts || {}) }
    };
  } catch {
    return fallback;
  }
}

function createEmptyCompletedActivities() {
  return Object.fromEntries(
    activityKinds.map((kind) => [
      kind,
      Object.fromEntries(languageNodes.map((node) => [node.id, []]))
    ])
  );
}

function mergeCompletedActivities(saved = {}) {
  const empty = createEmptyCompletedActivities();
  for (const kind of activityKinds) {
    for (const node of languageNodes) {
      empty[kind][node.id] = Array.isArray(saved?.[kind]?.[node.id]) ? saved[kind][node.id] : [];
    }
  }
  return empty;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function bindEvents() {
  window.addEventListener("resize", layoutMapArt);

  dom.resetViewButton.addEventListener("click", () => {
    state.activeNode = "html";
    state.activeActivity = "lessons";
    state.activeItemId = "html-lesson-tags";
    saveState();
    renderAll();
    loadActivity("lessons", "html-lesson-tags");
  });

  for (const button of dom.activityButtons) {
    button.addEventListener("click", () => {
      selectActivityKind(button.dataset.activity);
    });
  }

  dom.focusChallengeButton.addEventListener("click", () => {
    dom.arena.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  dom.runButton.addEventListener("click", runActiveActivity);
  dom.hintButton.addEventListener("click", showHint);
  dom.resetCodeButton.addEventListener("click", () => {
    if (!activeActivity?.item?.starter) {
      dom.codeEditor.value = "";
      return;
    }
    dom.codeEditor.value = activeActivity.item.starter;
    state.editorDrafts[activeActivity.item.id] = activeActivity.item.starter;
    saveState();
    setOutput("Starter code restored.", "neutral");
  });

  dom.codeEditor.addEventListener("input", () => {
    if (!activeActivity?.item) {
      return;
    }
    state.editorDrafts[activeActivity.item.id] = dom.codeEditor.value;
    saveState();
  });
}

function renderAll() {
  renderPlayer();
  renderBadges();
  renderMap();
  renderActivities();
  renderActivityButtons();
}

function renderPlayer() {
  const profileLevel = getLevel(state.xp);
  const levelProgress = state.xp - (profileLevel - 1) * XP_PER_LEVEL;
  const badges = getUnlockedBadges();

  dom.levelLabel.textContent = `Lv. ${profileLevel}`;
  dom.xpLabel.textContent = `${levelProgress} / ${XP_PER_LEVEL} XP`;
  dom.xpMeter.style.width = `${Math.min(100, (levelProgress / XP_PER_LEVEL) * 100)}%`;
  dom.streakValue.textContent = `${state.streak} days`;
  dom.pointValue.textContent = `${state.xp}`;
  dom.gemValue.textContent = `${state.gems}`;
  dom.gemTopValue.textContent = `${state.gems}`;
  dom.badgeValue.textContent = `${badges.length} / 30`;
  dom.questValue.textContent = `${getCompletedCount()}`;
  dom.dailyProgress.textContent = `${Math.min(3, state.dailyCompleted)} / 3`;
  dom.dailyMeter.style.width = `${Math.min(100, (state.dailyCompleted / 3) * 100)}%`;
}

function renderBadges() {
  const badges = getUnlockedBadges();
  const badgeMeta = {
    html: { id: "html5", label: "5", title: "HTML badge equipped" },
    css: { id: "css3", label: "3", title: "CSS badge equipped" },
    javascript: { id: "javascript", label: "JS", title: "JavaScript badge equipped" },
    python: { id: "python", label: "PY", title: "Python badge equipped" }
  };
  const equippedBadges = badges.slice(0, 4).map((id) => badgeMeta[id] || { id, label: id.slice(0, 2).toUpperCase(), title: `${id} badge equipped` });
  while (equippedBadges.length < 4) {
    equippedBadges.push({ id: "empty", label: "", title: "Empty badge slot" });
  }

  dom.badgeRow.replaceChildren(
    ...equippedBadges.map((badgeInfo) => {
      const badge = document.createElement("div");
      badge.className = `badge ${badgeInfo.id}`;
      badge.textContent = badgeInfo.label;
      badge.title = badgeInfo.title;
      return badge;
    })
  );
}

function renderMap() {
  dom.roadmapTitle.textContent = "THE WEB DEV ROADMAP";
  layoutMapArt();
  dom.realmLayer.replaceChildren(...mapNodes.map((node) => createRealm(node)));
  moveHeroToActiveNode();
  pulseSelectedNode();
}

function layoutMapArt() {
  const rect = dom.worldMap.getBoundingClientRect();
  const mapRatio = 1672 / 941;
  const isMobile = window.matchMedia("(max-width: 900px)").matches;
  const panelRatio = rect.width / Math.max(1, rect.height);
  let width;

  if (isMobile) {
    width = Math.max(760, rect.height * mapRatio, rect.width * 2.15);
  } else if (panelRatio > 2.25) {
    width = Math.min(rect.width, rect.height * mapRatio * 1.14);
  } else {
    width = Math.max(rect.width, rect.height * mapRatio);
  }

  dom.mapArt.style.width = `${Math.ceil(width)}px`;
}

function createRealm(node) {
  const layout = nodeLayout[node.id];
  const realm = document.createElement("article");
  realm.className = `realm realm-${node.id}`;
  realm.style.left = `${layout.left}%`;
  realm.style.top = `${layout.top}%`;
  realm.style.setProperty("--node-color", node.accent);

  const island = document.createElement("div");
  island.className = "island";
  realm.append(island);

  for (const [className, x, y] of propsByNode[node.id] || []) {
    const prop = document.createElement("span");
    prop.className = `prop ${className}`;
    prop.style.left = `${x}px`;
    prop.style.top = `${y}px`;
    realm.append(prop);
  }

  const locked = isNodeLocked(node);
  const complete = node.id !== "final" && isNodeComplete(node.id);
  const card = document.createElement("div");
  card.className = ["realm-card", locked ? "locked" : "", state.activeNode === node.id ? "active" : ""].filter(Boolean).join(" ");
  card.innerHTML = `
    <span class="realm-number">${node.order}</span>
    <h3>${node.title}</h3>
    <p>${locked ? `Unlock at ${node.unlockXp} XP` : node.short}</p>
    <span class="realm-status ${locked ? "locked" : ""}">${statusIcon(node, locked, complete)} ${statusText(node, locked, complete)}</span>
  `;

  const button = document.createElement("button");
  button.type = "button";
  button.ariaLabel = `${node.title} realm`;
  button.disabled = node.id === "final" || locked;
  button.addEventListener("click", () => selectNode(node.id));
  card.append(button);
  realm.append(card);

  return realm;
}

function statusIcon(node, locked, complete) {
  if (node.id === "final") return "★";
  if (locked) return "🔒";
  if (complete) return "✓";
  return "★";
}

function statusText(node, locked, complete) {
  if (node.id === "final") return "???";
  if (locked) return "Locked";
  if (complete) return "Completed!";
  return "In Progress";
}

function renderActivities() {
  const node = getNode(state.activeNode);
  const kind = normalizeActivityKind(state.activeActivity);
  const activities = getActivities(node, kind);
  const locked = isNodeLocked(node);
  const readyCount = activities.filter((activity) => !isActivityComplete(kind, node.id, activity.id)).length;

  dom.activityTitle.textContent = `${node.title} ${kind.toUpperCase()}`;
  dom.challengeCount.textContent = `${locked ? "locked" : `${readyCount} ready`}`;
  dom.focusChallengeButton.textContent = `View all ${kind} →`;
  dom.challengeList.replaceChildren(
    ...(activities.length ? activities.map((activity, index) => createActivityItem(node, kind, activity, index, locked)) : [createEmptyActivityItem(node, kind)])
  );
}

function createActivityItem(node, kind, activity, index, locked) {
  const complete = isActivityComplete(kind, node.id, activity.id);
  const item = document.createElement("article");
  item.className = `challenge-item activity-item ${complete ? "complete" : ""}`;
  item.style.setProperty("--node-color", node.accent);
  item.innerHTML = `
    <div class="challenge-icon">${activityIcon(kind, index)}</div>
    <div>
      <h3>${activity.title}</h3>
      <p>${activity.prompt || activity.body || node.description}</p>
      <strong>${complete ? "Completed" : `+${activity.xp || 0} XP`}</strong>
    </div>
  `;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "start-button";
  button.textContent = locked ? "Locked" : complete ? "Review" : activityButtonLabel(kind);
  button.disabled = locked;
  button.addEventListener("click", () => loadActivity(kind, activity.id));
  item.append(button);
  return item;
}

function createEmptyActivityItem(node, kind) {
  const item = document.createElement("article");
  item.className = "challenge-item activity-item";
  item.style.setProperty("--node-color", node.accent);
  item.innerHTML = `
    <div class="challenge-icon">${activityIcon(kind, 0)}</div>
    <div>
      <h3>${node.title} ${kind}</h3>
      <p>This section is locked or waiting for its generated ${kind} track.</p>
      <strong>+0 XP</strong>
    </div>
  `;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "start-button";
  button.disabled = true;
  button.textContent = "Locked";
  item.append(button);
  return item;
}

function renderActivityButtons() {
  for (const button of dom.activityButtons) {
    button.classList.toggle("active", button.dataset.activity === state.activeActivity);
  }
}

function selectActivityKind(kind) {
  const normalized = normalizeActivityKind(kind);
  const node = getNode(state.activeNode);
  const first = firstActivity(node, normalized);

  state.activeActivity = normalized;
  state.activeItemId = first?.id || "";
  saveState();
  renderAll();
  if (first) {
    loadActivity(normalized, first.id);
  }
}

function selectNode(nodeId) {
  const node = getNode(nodeId);
  if (isNodeLocked(node)) {
    setOutput(`${node.title} is locked. Earn ${Math.max(0, node.unlockXp - state.xp)} more XP.`, "error");
    return;
  }

  state.activeNode = node.id;
  const firstOpen = firstIncompleteActivity(node, state.activeActivity) || firstActivity(node, state.activeActivity);
  state.activeItemId = firstOpen?.id || "";
  saveState();
  renderAll();
  if (firstOpen) {
    loadActivity(state.activeActivity, firstOpen.id);
  }
}

function moveHeroToActiveNode() {
  const targetNode = state.activeNode || "javascript";

  if (displayedHeroNode === targetNode && heroTargetNode === targetNode) {
    positionHeroAt(heroLayout[targetNode] || heroLayout.javascript, { instant: true });
    return;
  }

  if (heroTargetNode === targetNode && dom.mapHero.classList.contains("walking")) {
    return;
  }

  animateHeroToNode(targetNode);
}

function loadActivity(kind = state.activeActivity, activityId = state.activeItemId, options = {}) {
  const normalizedKind = normalizeActivityKind(kind);
  const node = getNode(state.activeNode);
  let { activity } = getActivity(node.id, normalizedKind, activityId);
  activity = activity || firstActivity(node, normalizedKind) || firstActivity(node, "lessons");
  if (!activity) {
    return;
  }

  activeActivity = { kind: normalizedKind, node, item: activity };
  state.activeActivity = normalizedKind;
  state.activeItemId = activity.id;
  if (normalizedKind === "challenges") {
    state.activeChallenge = activity.id;
  }

  dom.arenaLanguage.textContent = `${node.title} ${singularActivityLabel(normalizedKind)}`;
  dom.arenaPrompt.textContent = activity.prompt || activity.body || node.description;
  dom.codeEditor.readOnly = normalizedKind === "lessons";
  dom.codeEditor.value = getEditorValue(normalizedKind, activity);
  dom.runButton.textContent = runButtonLabel(normalizedKind);
  dom.hintButton.textContent = normalizedKind === "lessons" ? "Note" : "Hint";
  dom.resetCodeButton.disabled = !activity.starter;
  saveState();
  renderAll();

  if (!options.quiet) {
    setOutput(activityOutput(normalizedKind, activity), "neutral");
  }
}

function getEditorValue(kind, activity) {
  if (kind === "lessons") {
    return activity.body || activity.prompt || "";
  }
  if (kind === "quizzes") {
    return state.editorDrafts[activity.id] || "";
  }
  return state.editorDrafts[activity.id] || activity.starter || "";
}

function activityOutput(kind, activity) {
  if (kind === "lessons") {
    return `${activity.title}\n\n${activity.body || activity.prompt}`;
  }
  if (kind === "quizzes") {
    return `${activity.title}\n\n${activity.body || "Type your answer in the editor, then submit."}`;
  }
  return `Loaded ${activity.title}.`;
}

function runActiveActivity() {
  if (!activeActivity) {
    return;
  }

  const { kind, node, item } = activeActivity;
  const previousLevel = getLevel(state.xp);

  if (kind === "lessons") {
    completeActivity(kind, node, item, previousLevel);
    return;
  }

  if (kind === "quizzes") {
    const answer = dom.codeEditor.value.trim().toLowerCase().replace(/[<>]/g, "");
    if (answer !== String(item.answer || "").toLowerCase()) {
      setOutput(`Almost. Hint: ${item.hint}`, "error");
      return;
    }
    completeActivity(kind, node, item, previousLevel);
    return;
  }

  const result = evaluateChallenge(item, dom.codeEditor.value);

  if (!result.passed) {
    setOutput(`Almost. Missing:\n- ${result.missing.join("\n- ")}`, "error");
    return;
  }

  completeActivity(kind, node, item, previousLevel);
}

function completeActivity(kind, node, activity, previousLevel) {
  const alreadyComplete = isActivityComplete(kind, node.id, activity.id);
  if (!alreadyComplete) {
    state.completedActivities[kind][node.id] = [...getCompletedIds(kind, node.id), activity.id];
    state.xp += activity.xp || 0;
    state.gems += kind === "lessons" ? 0 : 5;
    state.streak = Math.max(1, state.streak);
    if (kind === "challenges") {
      state.dailyCompleted = Math.min(3, state.dailyCompleted + 1);
      if (state.dailyCompleted === 3) {
        state.gems += 20;
      }
    }
  }

  handleLevelUnlock(previousLevel);

  saveState();
  renderAll();
  if (!alreadyComplete) {
    playRewardBurst(node.id, kind);
    pulseHudProgress();
  }
  setOutput(
    alreadyComplete
      ? "Check passed. Practice run complete."
      : `${singularActivityLabel(kind)} complete. +${activity.xp || 0} XP${kind === "lessons" ? "." : " and +5 gems earned."}`,
    "success"
  );
}

function showHint() {
  if (!activeActivity) {
    return;
  }
  const { kind, item } = activeActivity;
  setOutput(kind === "lessons" ? item.body || item.prompt : `Hint: ${item.hint || "Review the prompt carefully."}`, "neutral");
}

function setOutput(message, tone) {
  dom.outputPanel.textContent = message;
  dom.outputPanel.classList.toggle("success", tone === "success");
  dom.outputPanel.classList.toggle("error", tone === "error");
}

function setupLiveStars() {
  if (!dom.liveStars) {
    return;
  }

  const stars = Array.from({ length: starCount }, (_, index) => {
    const star = document.createElement("span");
    star.className = `star star-${index % 5 === 0 ? "cross" : index % 7 === 0 ? "flare" : "dot"}`;
    return star;
  });
  dom.liveStars.replaceChildren(...stars);
  randomizeStars(stars, true);

  if (!prefersReducedMotion()) {
    animateStarfield(stars);
    window.setInterval(() => randomizeStars(stars, false), 2600);
  }
}

function randomizeStars(stars, forceAll) {
  for (const star of stars) {
    if (!forceAll && Math.random() > 0.28) {
      continue;
    }

    const size = randomBetween(1.3, 4.8);
    star.style.setProperty("--star-x", `${randomBetween(1, 99).toFixed(2)}%`);
    star.style.setProperty("--star-y", `${randomBetween(1, 99).toFixed(2)}%`);
    star.style.setProperty("--star-size", `${size.toFixed(2)}px`);
    star.style.setProperty("--star-opacity", randomBetween(0.38, 0.92).toFixed(2));
    star.style.setProperty("--sparkle-speed", `${Math.round(randomBetween(900, 2600))}ms`);
    star.style.setProperty("--star-color", starColors[Math.floor(Math.random() * starColors.length)]);
    star.style.animationDelay = `${Math.round(randomBetween(-2200, 0))}ms`;
  }
}

function animateStarfield(stars) {
  const gsap = window.gsap;
  if (!gsap) {
    return;
  }

  for (const [index, star] of stars.entries()) {
    gsap.to(star, {
      x: randomBetween(-8, 8),
      y: randomBetween(-7, 7),
      scale: randomBetween(0.85, 1.45),
      opacity: randomBetween(0.45, 0.95),
      duration: randomBetween(2.2, 5.6),
      delay: index * 0.018,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }
}

function setupAmbientMotion() {
  if (prefersReducedMotion() || !window.gsap) {
    return;
  }

  window.gsap.to(".map-art-image", {
    filter: "saturate(1.18) brightness(1.08)",
    duration: 4.8,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  window.gsap.to(".currency-pill", {
    y: -1,
    duration: 1.8,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
}

function animateHeroToNode(targetNode) {
  const fromNode = displayedHeroNode || state.activeNode || "javascript";
  const targetLayout = heroLayout[targetNode] || heroLayout.javascript;
  const route = buildHeroRoute(fromNode, targetNode);
  const animationId = heroAnimationId + 1;

  heroAnimationId = animationId;
  heroTargetNode = targetNode;
  if (heroTimeline) {
    heroTimeline.kill();
    heroTimeline = null;
  }

  if (route.length <= 1 || prefersReducedMotion()) {
    displayedHeroNode = targetNode;
    heroTargetNode = targetNode;
    positionHeroAt(targetLayout, { instant: true });
    dom.mapHero.classList.remove("walking");
    return;
  }

  walkHeroRoute(route, targetNode, animationId);
}

async function walkHeroRoute(route, targetNode, animationId) {
  if (window.gsap && !prefersReducedMotion()) {
    await walkHeroRouteWithGsap(route, targetNode, animationId);
    return;
  }

  dom.mapHero.classList.add("walking");

  for (let index = 1; index < route.length; index += 1) {
    if (animationId !== heroAnimationId) {
      return;
    }

    const previous = route[index - 1];
    const next = route[index];
    const distance = Math.hypot(next.left - previous.left, next.top - previous.top);
    const duration = Math.round(Math.max(220, Math.min(720, distance * 36)));
    dom.mapHero.style.setProperty("--hero-facing", next.left < previous.left ? "-1" : "1");
    spawnPathSpark(previous, next);
    positionHeroAt(next, { duration, behavior: "smooth" });
    await wait(duration + 40);
  }

  if (animationId !== heroAnimationId) {
    return;
  }

  displayedHeroNode = targetNode;
  heroTargetNode = targetNode;
  dom.mapHero.classList.remove("walking");
  positionHeroAt(heroLayout[targetNode] || heroLayout.javascript, { duration: 180, behavior: "smooth" });
}

function walkHeroRouteWithGsap(route, targetNode, animationId) {
  const gsap = window.gsap;
  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    onStart: () => {
      dom.mapHero.classList.add("walking", "gsap-motion");
      liftRealmCards();
    },
    onComplete: () => {
      if (animationId !== heroAnimationId) {
        return;
      }
      displayedHeroNode = targetNode;
      heroTargetNode = targetNode;
      heroTimeline = null;
      dom.mapHero.classList.remove("walking", "gsap-motion");
      positionHeroAt(heroLayout[targetNode] || heroLayout.javascript, { instant: true });
      spawnArrivalBurst(targetNode);
    }
  });

  heroTimeline = timeline;

  for (let index = 1; index < route.length; index += 1) {
    const previous = route[index - 1];
    const next = route[index];
    const distance = Math.hypot(next.left - previous.left, next.top - previous.top);
    const duration = Math.max(0.22, Math.min(0.84, distance * 0.045));

    timeline.add(() => {
      if (animationId !== heroAnimationId) {
        timeline.kill();
        return;
      }
      dom.mapHero.style.setProperty("--hero-facing", next.left < previous.left ? "-1" : "1");
      spawnPathSpark(previous, next);
      centerHeroInMobileView(next, "smooth");
    });
    timeline.to(dom.mapHero, {
      left: `${next.left}%`,
      top: `${next.top}%`,
      duration,
      onUpdate: () => centerHeroDuringMotion()
    });
  }

  return new Promise((resolve) => {
    timeline.eventCallback("onComplete", () => {
      if (animationId === heroAnimationId) {
        displayedHeroNode = targetNode;
        heroTargetNode = targetNode;
        heroTimeline = null;
        dom.mapHero.classList.remove("walking", "gsap-motion");
        positionHeroAt(heroLayout[targetNode] || heroLayout.javascript, { instant: true });
        spawnArrivalBurst(targetNode);
      }
      resolve();
    });
  });
}

function centerHeroDuringMotion() {
  const now = performance.now();
  if (now - lastMobileCenter < 180) {
    return;
  }
  lastMobileCenter = now;
  centerHeroInMobileView({
    left: parseFloat(dom.mapHero.style.left) || heroLayout[state.activeNode]?.left || 50,
    top: parseFloat(dom.mapHero.style.top) || heroLayout[state.activeNode]?.top || 50
  }, "auto");
}

function spawnPathSpark(previous, next) {
  if (!dom.mapEffects || prefersReducedMotion()) {
    return;
  }

  const node = getMapNode(heroTargetNode);
  const count = window.gsap ? 5 : 2;
  for (let index = 0; index < count; index += 1) {
    const t = (index + 1) / (count + 1);
    const point = {
      left: previous.left + (next.left - previous.left) * t + randomBetween(-0.7, 0.7),
      top: previous.top + (next.top - previous.top) * t + randomBetween(-0.7, 0.7)
    };
    createMapParticle("path-spark", point, {
      color: node?.accent || "#65edff",
      duration: randomBetween(0.55, 1.05),
      driftX: randomBetween(-18, 18),
      driftY: randomBetween(-26, -10),
      scale: randomBetween(0.5, 1.25)
    });
  }
}

function spawnArrivalBurst(nodeId) {
  const layout = heroLayout[nodeId] || heroLayout.javascript;
  const node = getMapNode(nodeId);
  createMapParticle("arrival-ring", layout, {
    color: node.accent || "#65edff",
    duration: 0.95,
    scale: 1.8
  });

  for (let index = 0; index < 12; index += 1) {
    createMapParticle("arrival-spark", layout, {
      color: index % 3 === 0 ? "#ffd438" : node.accent || "#65edff",
      duration: randomBetween(0.55, 1.2),
      driftX: Math.cos((Math.PI * 2 * index) / 12) * randomBetween(12, 38),
      driftY: Math.sin((Math.PI * 2 * index) / 12) * randomBetween(10, 32),
      scale: randomBetween(0.5, 1.35)
    });
  }
}

function playRewardBurst(nodeId, kind) {
  const layout = heroLayout[nodeId] || heroLayout[state.activeNode] || heroLayout.html;
  const node = getMapNode(nodeId);
  const rewardColor = kind === "lessons" ? "#65edff" : "#ffd438";
  const color = node?.accent || rewardColor;

  createMapParticle("reward-ring", layout, { color, duration: 1, scale: 2.2 });
  for (let index = 0; index < 16; index += 1) {
    createMapParticle("reward-spark", layout, {
      color: index % 2 === 0 ? rewardColor : color,
      duration: randomBetween(0.6, 1.35),
      driftX: Math.cos((Math.PI * 2 * index) / 16) * randomBetween(18, 52),
      driftY: Math.sin((Math.PI * 2 * index) / 16) * randomBetween(16, 44),
      scale: randomBetween(0.55, 1.4)
    });
  }
}

function pulseSelectedNode() {
  const nodeId = state.activeNode;
  if (!nodeId || lastPulsedNode === nodeId || !dom.mapEffects) {
    return;
  }

  lastPulsedNode = nodeId;
  const layout = nodeLayout[nodeId] || heroLayout[nodeId] || heroLayout.html;
  const node = getMapNode(nodeId);
  createMapParticle("node-pulse", layout, {
    color: node.accent || "#65edff",
    duration: 1.2,
    scale: 2.6
  });
}

function pulseHudProgress() {
  if (!window.gsap || prefersReducedMotion()) {
    return;
  }

  window.gsap.fromTo(
    [dom.xpMeter, dom.gemTopValue],
    { filter: "brightness(1.8)" },
    { filter: "brightness(1)", duration: 0.8, ease: "power2.out" }
  );
}

function liftRealmCards() {
  if (!window.gsap || prefersReducedMotion()) {
    return;
  }

  window.gsap.fromTo(
    ".realm-card.active",
    { filter: "brightness(1.25) saturate(1.15)" },
    { filter: "brightness(1) saturate(1)", duration: 0.5, ease: "power2.out" }
  );
}

function createMapParticle(className, layout, options = {}) {
  if (!dom.mapEffects) {
    return;
  }

  const particle = document.createElement("span");
  particle.className = `map-particle ${className}`;
  particle.style.left = `${layout.left}%`;
  particle.style.top = `${layout.top}%`;
  particle.style.setProperty("--particle-color", options.color || "#65edff");
  dom.mapEffects.append(particle);

  if (!window.gsap || prefersReducedMotion()) {
    window.setTimeout(() => particle.remove(), Math.round((options.duration || 0.8) * 1000));
    return;
  }

  window.gsap.fromTo(
    particle,
    {
      x: 0,
      xPercent: -50,
      y: 0,
      yPercent: -50,
      scale: 0.35,
      opacity: 0.95
    },
    {
      x: options.driftX || 0,
      y: options.driftY || 0,
      scale: options.scale || 1,
      opacity: 0,
      duration: options.duration || 0.8,
      ease: "power2.out",
      onComplete: () => particle.remove()
    }
  );
}

function buildHeroRoute(fromNode, targetNode) {
  if (fromNode === targetNode) {
    return [heroLayout[targetNode] || heroLayout.javascript];
  }

  const path = findRoutePath(fromNode, targetNode);
  if (!path.length) {
    return [heroLayout[fromNode] || heroLayout.javascript, heroLayout[targetNode] || heroLayout.javascript];
  }

  const route = [];
  for (let index = 0; index < path.length - 1; index += 1) {
    const from = path[index];
    const to = path[index + 1];
    const segment = routeGraph[from]?.[to] || [];

    if (index === 0) {
      route.push(heroLayout[from] || heroLayout.javascript);
    }
    route.push(...segment, heroLayout[to] || heroLayout.javascript);
  }

  return route.filter((point, index, points) => {
    const previous = points[index - 1];
    return !previous || previous.left !== point.left || previous.top !== point.top;
  });
}

function findRoutePath(fromNode, targetNode) {
  const queue = [[fromNode, [fromNode]]];
  const visited = new Set([fromNode]);

  while (queue.length) {
    const [node, path] = queue.shift();
    const neighbors = Object.keys(routeGraph[node] || {});

    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) {
        continue;
      }

      const nextPath = [...path, neighbor];
      if (neighbor === targetNode) {
        return nextPath;
      }

      visited.add(neighbor);
      queue.push([neighbor, nextPath]);
    }
  }

  return [];
}

function positionHeroAt(layout, options = {}) {
  const duration = options.instant ? 0 : options.duration || 420;
  dom.mapHero.style.setProperty("--hero-step-duration", `${duration}ms`);
  dom.mapHero.style.left = `${layout.left}%`;
  dom.mapHero.style.top = `${layout.top}%`;
  centerHeroInMobileView(layout, options.behavior || (options.instant ? "auto" : "smooth"));
}

function centerHeroInMobileView(layout, behavior = "smooth") {
  window.requestAnimationFrame(() => {
    const overflowX = window.getComputedStyle(dom.worldMap).overflowX;
    if (!/auto|scroll/.test(overflowX) || dom.worldMap.scrollWidth <= dom.worldMap.clientWidth + 4) {
      return;
    }

    const targetLeft = dom.mapArt.offsetLeft + (dom.mapArt.offsetWidth * layout.left) / 100 - dom.worldMap.clientWidth / 2;
    const maxLeft = dom.worldMap.scrollWidth - dom.worldMap.clientWidth;
    dom.worldMap.scrollTo({
      left: Math.max(0, Math.min(maxLeft, targetLeft)),
      behavior
    });
  });
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getMapNode(nodeId) {
  return mapNodes.find((node) => node.id === nodeId) || getNode(nodeId);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function isNodeLocked(node) {
  return state.xp < node.unlockXp;
}

function normalizeActivityKind(kind) {
  return activityKinds.includes(kind) ? kind : "lessons";
}

function firstActivity(node, kind) {
  return getActivities(node, normalizeActivityKind(kind))[0] || null;
}

function firstIncompleteActivity(node, kind) {
  const normalizedKind = normalizeActivityKind(kind);
  return getActivities(node, normalizedKind).find((activity) => !isActivityComplete(normalizedKind, node.id, activity.id)) || null;
}

function getCompletedIds(kind, nodeId) {
  return state.completedActivities?.[normalizeActivityKind(kind)]?.[nodeId] || [];
}

function isActivityComplete(kind, nodeId, activityId) {
  return getCompletedIds(kind, nodeId).includes(activityId);
}

function isNodeComplete(nodeId) {
  const node = getNode(nodeId);
  return activityKinds.every((kind) => {
    const activities = getActivities(node, kind);
    return activities.length > 0 && activities.every((activity) => isActivityComplete(kind, nodeId, activity.id));
  });
}

function getCompletedCount() {
  return activityKinds.reduce((total, kind) => {
    return total + Object.values(state.completedActivities?.[kind] || {}).reduce((sum, list) => sum + list.length, 0);
  }, 0);
}

function getUnlockedBadges() {
  return languageNodes
    .filter((node) => isNodeComplete(node.id))
    .map((node) => node.id);
}

function getLevel(xp) {
  return Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
}

function handleLevelUnlock(previousLevel) {
  const nextLevel = getLevel(state.xp);
  if (nextLevel <= previousLevel) {
    return;
  }

  const nextNode = languageNodes[nextLevel - 1];
  if (!nextNode || isNodeLocked(nextNode)) {
    return;
  }

  state.activeNode = nextNode.id;
  state.activeActivity = "lessons";
  state.activeItemId = firstActivity(nextNode, "lessons")?.id || firstActivity(nextNode, "challenges")?.id || "";
}

function singularActivityLabel(kind) {
  const labels = {
    lessons: "Lesson",
    challenges: "Challenge",
    projects: "Project",
    quizzes: "Quiz"
  };
  return labels[normalizeActivityKind(kind)];
}

function activityButtonLabel(kind) {
  const labels = {
    lessons: "Open",
    challenges: "Start",
    projects: "Build",
    quizzes: "Take"
  };
  return labels[normalizeActivityKind(kind)];
}

function runButtonLabel(kind) {
  const labels = {
    lessons: "Complete Lesson ▶",
    challenges: "Run Code ▶",
    projects: "Run Project ▶",
    quizzes: "Submit Quiz ▶"
  };
  return labels[normalizeActivityKind(kind)];
}

function activityIcon(kind, index) {
  const icons = {
    lessons: "📖",
    challenges: "⚔️",
    projects: "</>",
    quizzes: "?"
  };
  return kind === "projects" ? icons.projects : icons[normalizeActivityKind(kind)] || String(index + 1);
}
})();
