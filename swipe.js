/**
  Swipe Cup — World Cup Swipe Predictor Engine
  Gesture Tracking, background Standings Calculator & State Coordinator
*/

const TEAMS_DB = TournamentData.TEAMS_DB;
const GROUPS_DATA = TournamentData.GROUPS_DATA;
const GROUP_STAGE_MATCHES = TournamentData.GROUP_STAGE_MATCHES_FLAT;

const APP_TITLE_DEFAULT = "Your 2026 World Cup, One Match at a Time";
/** Set when user taps "Start My World Cup"; cleared when intro is dismissed. */
const SWIPE_INTRO_PENDING_KEY = "wc_swipe_intro_pending";
let swipeIntroPending = false;
const LOADING_LINES = [
  "Warming up the teams…",
  "Drawing the groups…",
  "Checking the pitch…",
  "Waiting for kickoff…",
  "Building your bracket…"
];
const ERROR_KICKOFF_MSG =
  "Something went wrong before kickoff. Refresh and we'll replay the match.";

// Knockout matches resolution matching index.html
const KNOCKOUT_MATCHES = {
  73: { label: "M73: Runner-up A vs Runner-up B", resolve: () => ({ a: state.groupStandings["A"][1], b: state.groupStandings["B"][1] }) },
  74: { label: "M74: Winner C vs Runner-up F", resolve: () => ({ a: state.groupStandings["C"][0], b: state.groupStandings["F"][1] }) },
  75: { label: "M75: Winner E vs Wildcard 1", resolve: () => ({ a: state.groupStandings["E"][0], b: getWildcardForSlot(0) }) },
  76: { label: "M76: Winner F vs Runner-up C", resolve: () => ({ a: state.groupStandings["F"][0], b: state.groupStandings["C"][1] }) },
  77: { label: "M77: Winner I vs Wildcard 2", resolve: () => ({ a: state.groupStandings["I"][0], b: getWildcardForSlot(1) }) },
  78: { label: "M78: Winner A vs Wildcard 3", resolve: () => ({ a: state.groupStandings["A"][0], b: getWildcardForSlot(2) }) },
  79: { label: "M79: Winner L vs Wildcard 4", resolve: () => ({ a: state.groupStandings["L"][0], b: getWildcardForSlot(3) }) },
  80: { label: "M80: Winner G vs Wildcard 5", resolve: () => ({ a: state.groupStandings["G"][0], b: getWildcardForSlot(4) }) },
  81: { label: "M81: Winner D vs Wildcard 6", resolve: () => ({ a: state.groupStandings["D"][0], b: getWildcardForSlot(5) }) },
  82: { label: "M82: Winner H vs Runner-up J", resolve: () => ({ a: state.groupStandings["H"][0], b: state.groupStandings["J"][1] }) },
  83: { label: "M83: Runner-up E vs Runner-up I", resolve: () => ({ a: state.groupStandings["E"][1], b: state.groupStandings["I"][1] }) },
  84: { label: "M84: Winner K vs Wildcard 8", resolve: () => ({ a: state.groupStandings["K"][0], b: getWildcardForSlot(7) }) },
  85: { label: "M85: Winner B vs Wildcard 7", resolve: () => ({ a: state.groupStandings["B"][0], b: getWildcardForSlot(6) }) },
  86: { label: "M86: Runner-up D vs Runner-up G", resolve: () => ({ a: state.groupStandings["D"][1], b: state.groupStandings["G"][1] }) },
  87: { label: "M87: Winner J vs Runner-up H", resolve: () => ({ a: state.groupStandings["J"][0], b: state.groupStandings["H"][1] }) },
  88: { label: "M88: Runner-up K vs Runner-up L", resolve: () => ({ a: state.groupStandings["K"][1], b: state.groupStandings["L"][1] }) },

  89: { label: "M89: Winner 74 vs Winner 77", resolve: () => ({ a: state.knockoutPicks[74], b: state.knockoutPicks[77] }) },
  90: { label: "M90: Winner 73 vs Winner 75", resolve: () => ({ a: state.knockoutPicks[73], b: state.knockoutPicks[75] }) },
  91: { label: "M91: Winner 76 vs Winner 78", resolve: () => ({ a: state.knockoutPicks[76], b: state.knockoutPicks[78] }) },
  92: { label: "M92: Winner 79 vs Winner 80", resolve: () => ({ a: state.knockoutPicks[79], b: state.knockoutPicks[80] }) },
  93: { label: "M93: Winner 83 vs Winner 84", resolve: () => ({ a: state.knockoutPicks[83], b: state.knockoutPicks[84] }) },
  94: { label: "M94: Winner 81 vs Winner 82", resolve: () => ({ a: state.knockoutPicks[81], b: state.knockoutPicks[82] }) },
  95: { label: "M95: Winner 86 vs Winner 88", resolve: () => ({ a: state.knockoutPicks[86], b: state.knockoutPicks[88] }) },
  96: { label: "M96: Winner 85 vs Winner 87", resolve: () => ({ a: state.knockoutPicks[85], b: state.knockoutPicks[87] }) },

  97: { label: "QF 1: Winner 89 vs Winner 90", resolve: () => ({ a: state.knockoutPicks[89], b: state.knockoutPicks[90] }) },
  98: { label: "QF 2: Winner 93 vs Winner 94", resolve: () => ({ a: state.knockoutPicks[93], b: state.knockoutPicks[94] }) },
  99: { label: "QF 3: Winner 91 vs Winner 92", resolve: () => ({ a: state.knockoutPicks[91], b: state.knockoutPicks[92] }) },
  100: { label: "QF 4: Winner 95 vs Winner 96", resolve: () => ({ a: state.knockoutPicks[95], b: state.knockoutPicks[96] }) },

  101: { label: "SF 1: Winner 97 vs Winner 98", resolve: () => ({ a: state.knockoutPicks[97], b: state.knockoutPicks[98] }) },
  102: { label: "SF 2: Winner 99 vs Winner 100", resolve: () => ({ a: state.knockoutPicks[99], b: state.knockoutPicks[100] }) },

  103: {
    label: "Match 103: Loser 101 vs Loser 102",
    resolve: () => {
      const winner101 = state.knockoutPicks[101];
      const winner102 = state.knockoutPicks[102];
      const teams101 = KNOCKOUT_MATCHES[101].resolve();
      const teams102 = KNOCKOUT_MATCHES[102].resolve();
      const loser101 = winner101 === teams101.a ? teams101.b : teams101.a;
      const loser102 = winner102 === teams102.a ? teams102.b : teams102.a;
      return { a: loser101, b: loser102 };
    }
  },
  104: { label: "Match 104: Winner 101 vs Winner 102", resolve: () => ({ a: state.knockoutPicks[101], b: state.knockoutPicks[102] }) }
};

function getWildcardForSlot(idx) {
  return state.thirdPlaceQualifiers[idx] || null;
}

// --- 2. APPLICATION STATE ENGINE & HISTORY SNAPSHOTS ---
let state = {
  wizardStep: "welcome", // Share compatible
  userName: "",
  groupMatchScores: {},
  groupStandings: {},
  knockoutScores: {},
  knockoutPicks: {},
  thirdPlaceQualifiers: [],
  goalscorers: {},
  savedBrackets: [],
  actualResults: null,
  isViewer: false
};

// Global history array for state-snapshotting undo stack
const historyStack = [];

function pushStateSnapshot() {
  historyStack.push(JSON.stringify(state));
}

function popStateSnapshot() {
  if (historyStack.length === 0) return false;
  const snapshot = historyStack.pop();
  state = JSON.parse(snapshot);
  return true;
}

// --- ACTIVE MATCH CACHE FOR FLUID SWIPING PERFORMANCE ---
let cachedActiveMatch = null;

function refreshActiveMatchCache() {
  cachedActiveMatch = getActiveMatchIndex();
}

// --- DOM ELEMENT CACHE ---
const DOM = {
  paneSwipeWelcome: document.getElementById("pane-swipe-welcome"),
  paneSwipeDeck: document.getElementById("pane-swipe-deck"),
  paneSwipePodium: document.getElementById("pane-swipe-podium"),
  paneBracketView: document.getElementById("pane-bracket-view"),
  
  appHeaderTitle: document.getElementById("app-header-title"),
  stepperStageTitle: document.getElementById("stepper-stage-title"),
  stepperMatchProgress: document.getElementById("stepper-match-progress"),
  progressBarFill: document.getElementById("progress-bar-fill"),
  cardDeckContainer: document.getElementById("card-deck-container"),
  
  inputUserName: document.getElementById("input-user-name"),
  btnStartPrediction: document.getElementById("btn-start-prediction"),
  btnSimulateStage: document.getElementById("btn-simulate-stage"),
  btnUndo: document.getElementById("btn-undo"),
  btnChoiceLeft: document.getElementById("btn-choice-left"),
  btnChoiceUp: document.getElementById("btn-choice-up"),
  btnChoiceRight: document.getElementById("btn-choice-right"),
  btnReset: document.getElementById("btn-reset"),
  
  btnFlagA: document.getElementById("btn-flag-a"),
  btnFlagB: document.getElementById("btn-flag-b"),
  kbdDrawItem: document.getElementById("kbd-draw-item"),
  toastEl: document.getElementById("toast-el"),
  toastMsg: document.getElementById("toast-msg"),
  
  // Podium UI
  finishFlag: document.getElementById("finish-flag"),
  finishName: document.getElementById("finish-name"),
  finishSilverFlag: document.getElementById("finish-silver-flag"),
  finishSilverName: document.getElementById("finish-silver-name"),
  finishBronzeFlag: document.getElementById("finish-bronze-flag"),
  finishBronzeName: document.getElementById("finish-bronze-name"),
  quickUpsetTitle: document.getElementById("quick-upset-title"),
  quickUpsetMatch: document.getElementById("quick-upset-match"),
  
  btnShareResults: document.getElementById("btn-share-results"),
  btnViewBracket: document.getElementById("btn-view-bracket"),
  btnBackFromBracket: document.getElementById("btn-back-from-bracket"),
  bracketViewTitle: document.getElementById("bracket-view-title"),
  bracketViewGroups: document.getElementById("bracket-view-groups"),
  bracketViewKnockout: document.getElementById("bracket-view-knockout"),
  btnBracketToggleGroups: document.getElementById("btn-bracket-toggle-groups"),
  leaderboardChampionBars: document.getElementById("leaderboard-champion-bars"),
  leaderboardChampionBarsBody: document.getElementById("leaderboard-champion-bars-body"),
  leaderboardList: document.getElementById("leaderboard-list"),
  leaderboardUnconfigured: document.getElementById("leaderboard-unconfigured"),
  btnRefreshLeaderboard: document.getElementById("btn-refresh-leaderboard"),
  btnRestartSwipe: document.getElementById("btn-restart-swipe"),

  swipeIntroOverlay: document.getElementById("swipe-intro-overlay"),
  btnDismissSwipeIntro: document.getElementById("btn-dismiss-swipe-intro"),
  swipeIntroDraw: document.getElementById("swipe-intro-draw"),
  swipeIntroKnockoutNote: document.getElementById("swipe-intro-knockout-note"),
  deckLoadingMsg: document.getElementById("deck-loading-msg"),

  podiumChaosPanel: document.getElementById("podium-chaos-panel"),
  podiumChaosValue: document.getElementById("podium-chaos-value"),
  pathToGloryRoute: document.getElementById("path-to-glory-route")
};

function pickLoadingLine() {
  return LOADING_LINES[Math.floor(Math.random() * LOADING_LINES.length)];
}

function setDeckActiveMode(active) {
  document.body.classList.toggle("deck-active", !!active);
}

function queueSwipeIntro() {
  swipeIntroPending = true;
  try {
    sessionStorage.setItem(SWIPE_INTRO_PENDING_KEY, "1");
    localStorage.removeItem("wc_swipe_intro_seen_v1");
  } catch (e) {
    console.warn("Could not queue swipe intro", e);
  }
}

function clearSwipeIntroPending() {
  swipeIntroPending = false;
  try {
    sessionStorage.removeItem(SWIPE_INTRO_PENDING_KEY);
    localStorage.removeItem("wc_swipe_intro_seen_v1");
  } catch (e) {
    console.warn("Could not clear swipe intro pending", e);
  }
}

function shouldShowSwipeIntro() {
  if (swipeIntroPending) return true;
  try {
    return sessionStorage.getItem(SWIPE_INTRO_PENDING_KEY) === "1";
  } catch (_e) {
    return false;
  }
}

function showSwipeIntro(force = false) {
  if (!DOM.swipeIntroOverlay) return;
  if (!force && !shouldShowSwipeIntro()) return;
  DOM.swipeIntroOverlay.classList.remove("hidden");
  DOM.swipeIntroOverlay.setAttribute("aria-hidden", "false");
  updateSwipeIntroForStage();
}

function showSwipeIntroIfNeeded() {
  showSwipeIntro(false);
}

function hideSwipeIntro() {
  if (!DOM.swipeIntroOverlay) return;
  DOM.swipeIntroOverlay.classList.add("hidden");
  DOM.swipeIntroOverlay.setAttribute("aria-hidden", "true");
  clearSwipeIntroPending();
}

function resetSwipeCardTransform(card) {
  if (!card) return;
  card.style.transition = "";
  card.style.transform = "translate3d(0, 0, 0) rotate(0deg)";
  card.classList.remove("swipe-out-left", "swipe-out-right", "swipe-out-up", "dragging");
}

function updateSwipeIntroForStage() {
  const isGroups = cachedActiveMatch && cachedActiveMatch.stage === "groups";
  if (DOM.swipeIntroDraw) {
    DOM.swipeIntroDraw.classList.toggle("hidden", !isGroups);
  }
  if (DOM.swipeIntroKnockoutNote) {
    DOM.swipeIntroKnockoutNote.classList.toggle("hidden", isGroups);
  }
}

function bindSwipeIntroHandlers() {
  if (DOM.btnDismissSwipeIntro) {
    DOM.btnDismissSwipeIntro.addEventListener("click", hideSwipeIntro);
  }
}

// --- INITIALIZE & LOCAL STORAGE PERSISTENCE ---
const SWIPE_PROGRESS_KEY = "wc_2026_swipe_progress";
const LEGACY_PROGRESS_KEY = "wc_2026_simulator_save";
/** Tab session flag — refresh keeps this; new tab/window does not (welcome screen). */
const SWIPE_SESSION_KEY = "wc_swipe_session_active";
const SWIPE_AUTO_NICK_KEY = "wc_swipe_auto_nick";
const SWIPE_AUTO_SAVED_KEY = "wc_swipe_auto_saved";
/** Keep in-progress predictions for 14 days, then show welcome again. */
const SWIPE_PROGRESS_TTL_MS = 14 * 24 * 60 * 60 * 1000;

function isSwipeSessionActive() {
  try {
    return sessionStorage.getItem(SWIPE_SESSION_KEY) === "1";
  } catch (_e) {
    return false;
  }
}

function markSwipeSessionActive() {
  try {
    sessionStorage.setItem(SWIPE_SESSION_KEY, "1");
  } catch (e) {
    console.warn("Could not mark swipe session", e);
  }
}

function clearSwipeSession() {
  try {
    sessionStorage.removeItem(SWIPE_SESSION_KEY);
  } catch (e) {
    console.warn("Could not clear swipe session", e);
  }
}

function clearAutoSaveSession() {
  try {
    sessionStorage.removeItem(SWIPE_AUTO_NICK_KEY);
    sessionStorage.removeItem(SWIPE_AUTO_SAVED_KEY);
  } catch (e) {
    console.warn("Could not clear auto-save session", e);
  }
}

function buildAutoNickname(displayName) {
  let base =
    typeof SupabaseBracket !== "undefined"
      ? SupabaseBracket.normalizeNickname(displayName)
      : String(displayName || "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "_");
  if (base.length < 2) base = "fan";
  base = base.slice(0, 12);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}_${suffix}`.slice(0, 20);
}

function getOrCreateAutoNickname() {
  try {
    const existing = sessionStorage.getItem(SWIPE_AUTO_NICK_KEY);
    if (existing && typeof SupabaseBracket !== "undefined" && SupabaseBracket.isValidNickname(existing)) {
      return existing;
    }
    const nick = buildAutoNickname(state.userName);
    sessionStorage.setItem(SWIPE_AUTO_NICK_KEY, nick);
    return nick;
  } catch (_e) {
    return buildAutoNickname(state.userName);
  }
}

let autoSavePredictionInFlight = false;

async function autoSavePredictionToLeaderboard() {
  if (state.isViewer) return;
  if (typeof SupabaseBracket === "undefined" || !SupabaseBracket.isConfigured()) return;
  if (!state.knockoutPicks[104]) return;

  try {
    if (sessionStorage.getItem(SWIPE_AUTO_SAVED_KEY) === "1") return;
  } catch (_e) {
    /* ignore */
  }

  if (autoSavePredictionInFlight) return;
  autoSavePredictionInFlight = true;

  try {
    recalculateStandings();
    const payload = BracketShare.payloadFromSimulatorState(state);
    const nickname = getOrCreateAutoNickname();
    const result = await SupabaseBracket.submitBracket(nickname, payload, TEAMS_DB);

    if (result.ok) {
      try {
        sessionStorage.setItem(SWIPE_AUTO_SAVED_KEY, "1");
      } catch (_e) {
        /* ignore */
      }
      showToast("Added to community predictions!");
      void renderLeaderboard();
    } else {
      console.warn("Auto-save prediction failed:", result.error);
    }
  } catch (err) {
    console.warn("Auto-save prediction error:", err);
  } finally {
    autoSavePredictionInFlight = false;
  }
}

function resetSwipeStateInMemory() {
  state.wizardStep = "welcome";
  state.isViewer = false;
  state.userName = "";
  state.groupMatchScores = {};
  state.knockoutScores = {};
  state.knockoutPicks = {};
  state.thirdPlaceQualifiers = [];
  state.goalscorers = {};
  state.savedBrackets = [];
  state.actualResults = null;

  for (const g of Object.keys(GROUPS_DATA)) {
    state.groupStandings[g] = [...GROUPS_DATA[g]];
  }
  historyStack.length = 0;
  refreshActiveMatchCache();
  if (typeof CelebrationEffects !== "undefined") {
    CelebrationEffects.stopCelebration();
  }
}

/** Welcome screen for a new visit (does not read or wipe saved progress on disk). */
function beginWelcomeScreen() {
  resetSwipeStateInMemory();
  clearSwipeSession();
  clearAutoSaveSession();
  clearSwipeIntroPending();
}

/** Full reset when the user asks to start over. */
function initDefaultState() {
  resetSwipeStateInMemory();
  clearSwipeSession();
  clearAutoSaveSession();
  clearSwipeProgressStorage();
  clearSwipeIntroPending();
}

function clearSwipeProgressStorage() {
  try {
    localStorage.removeItem(SWIPE_PROGRESS_KEY);
    localStorage.removeItem(LEGACY_PROGRESS_KEY);
  } catch (e) {
    console.warn("Could not clear swipe progress", e);
  }
}

function serializeStateForStorage() {
  return {
    wizardStep: state.wizardStep,
    userName: state.userName,
    groupMatchScores: state.groupMatchScores,
    knockoutScores: state.knockoutScores,
    knockoutPicks: state.knockoutPicks,
    thirdPlaceQualifiers: state.thirdPlaceQualifiers,
    groupStandings: state.groupStandings,
    goalscorers: state.goalscorers,
    savedBrackets: state.savedBrackets,
    actualResults: state.actualResults
  };
}

function applyStoredState(data) {
  if (!data || typeof data !== "object") return false;

  state.wizardStep = data.wizardStep || "welcome";
  state.isViewer = false;
  state.userName = data.userName || "";
  state.groupMatchScores = data.groupMatchScores || {};
  state.knockoutScores = data.knockoutScores || {};
  state.knockoutPicks = data.knockoutPicks || {};
  state.thirdPlaceQualifiers = data.thirdPlaceQualifiers || [];
  state.groupStandings = data.groupStandings || {};
  state.goalscorers = data.goalscorers || {};
  state.savedBrackets = data.savedBrackets || [];
  state.actualResults = data.actualResults || null;

  for (const g of Object.keys(GROUPS_DATA)) {
    if (!state.groupStandings[g] || state.groupStandings[g].length < 4) {
      state.groupStandings[g] = [...GROUPS_DATA[g]];
    }
  }
  historyStack.length = 0;
  return true;
}

function hasMeaningfulProgress(data) {
  if (!data) return false;
  if (data.userName && data.wizardStep && data.wizardStep !== "welcome") return true;
  const groups = data.groupMatchScores || {};
  if (
    Object.keys(groups).some((key) =>
      TournamentStandings.isEnteredGroupResult(groups[key])
    )
  ) {
    return true;
  }
  return Object.keys(data.knockoutPicks || {}).length > 0;
}

function userRequestedFreshStart() {
  const params = new URLSearchParams(window.location.search);
  const v = params.get("restart") ?? params.get("new");
  return v === "1" || v === "true";
}

function stripFreshStartParamsFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("restart");
  url.searchParams.delete("new");
  const qs = url.searchParams.toString();
  window.history.replaceState(null, "", url.pathname + (qs ? `?${qs}` : "") + url.hash);
}

function parseProgressEnvelope(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.state && typeof parsed.savedAt === "number") {
      return { savedAt: parsed.savedAt, state: parsed.state };
    }
    if (parsed && (parsed.groupMatchScores || parsed.knockoutPicks || parsed.userName)) {
      return { savedAt: Date.now(), state: parsed };
    }
  } catch (e) {
    console.warn("Swipe progress parse failed", e);
  }
  return null;
}

function loadSwipeProgressEnvelope() {
  const keys = [SWIPE_PROGRESS_KEY, LEGACY_PROGRESS_KEY];
  for (let i = 0; i < keys.length; i++) {
    const envelope = parseProgressEnvelope(localStorage.getItem(keys[i]));
    if (envelope) return envelope;
  }
  return null;
}

/** @returns {{ restored: boolean, expired?: boolean }} */
function tryRestoreSwipeProgress() {
  const envelope = loadSwipeProgressEnvelope();
  if (!envelope || !hasMeaningfulProgress(envelope.state)) {
    return { restored: false };
  }

  const age = Date.now() - envelope.savedAt;
  if (age > SWIPE_PROGRESS_TTL_MS) {
    clearSwipeProgressStorage();
    return { restored: false, expired: true };
  }

  if (!applyStoredState(envelope.state)) {
    return { restored: false };
  }

  const snapshot = serializeStateForStorage();
  if (state.wizardStep === "welcome" && hasMeaningfulProgress(snapshot)) {
    state.wizardStep = "md1";
  }

  recalculateStandings();
  refreshActiveMatchCache();
  markSwipeSessionActive();
  return { restored: true };
}

function saveToLocalStorage() {
  if (state.isViewer) return;
  if (!hasMeaningfulProgress(serializeStateForStorage())) return;

  try {
    const envelope = {
      savedAt: Date.now(),
      state: serializeStateForStorage()
    };
    localStorage.setItem(SWIPE_PROGRESS_KEY, JSON.stringify(envelope));
  } catch (e) {
    console.warn("Could not save swipe progress", e);
  }
}

// --- 3. TOAST NOTIFICATION ---
function showToast(msg, isErr = false) {
  if (!DOM.toastEl) return;
  DOM.toastMsg.innerText = msg;
  DOM.toastEl.style.background = isErr ? "rgba(239, 68, 68, 0.95)" : "rgba(16, 185, 129, 0.95)";
  DOM.toastEl.classList.remove("hidden");
  setTimeout(() => {
    DOM.toastEl.classList.add("hidden");
  }, 2500);
}

// --- 4. WORLD CUP CALCULATIONS ENGINE (GROUP TIEBREAKS & STANDINGS) ---
function recalculateStandings() {
  const result = TournamentStandings.recalculate(state.groupMatchScores);
  state.groupStandings = result.groupStandings;
  state.thirdPlaceQualifiers = result.thirdPlaceQualifiers;
}

// --- 5. PROGRESS & CURRENT MATCH COORDINATOR ---
// Counts completed matches in predictions state to find active matchup
function getActiveMatchIndex() {
  // A. Group matches
  for (let i = 0; i < 72; i++) {
    const key = `${GROUP_STAGE_MATCHES[i].group}_${GROUP_STAGE_MATCHES[i].matchIndex}`;
    const score = state.groupMatchScores[key];
    if (!TournamentStandings.isEnteredGroupResult(score)) {
      return { stage: "groups", index: i, matchId: i + 1 };
    }
  }

  // B. Knockout matches
  for (let mId = 73; mId <= 104; mId++) {
    const pick = state.knockoutPicks[mId];
    if (!pick) {
      return { stage: "knockouts", index: mId - 73, matchId: mId };
    }
  }

  return { stage: "completed", index: 32, matchId: 105 };
}

// --- 6. GESTURE PHYSICS ENGINE (TOUCH & MOUSE SWIPES) ---
let startX = 0;
let startY = 0;
let isDragging = false;
let cardEl = null;

function bindSwipeGestures(card) {
  cardEl = card;
  resetSwipeCardTransform(card);

  card.addEventListener("mousedown", dragStart);
  card.addEventListener("touchstart", dragStart, { passive: true });
}

function dragStart(e) {
  isDragging = true;
  cardEl.classList.add("dragging");
  
  const clientX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.startsWith("touch") ? e.touches[0].clientY : e.clientY;
  
  startX = clientX;
  startY = clientY;
  
  document.addEventListener("mousemove", dragMove);
  document.addEventListener("touchmove", dragMove, { passive: false });
  document.addEventListener("mouseup", dragEnd);
  document.addEventListener("touchend", dragEnd);
}

function dragMove(e) {
  if (!isDragging || !cardEl || !cachedActiveMatch) return;
  
  const clientX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.startsWith("touch") ? e.touches[0].clientY : e.clientY;
  
  const dX = clientX - startX;
  const dY = clientY - startY;
  
  const rotation = dX * 0.1;
  cardEl.style.transform = `translate3d(${dX}px, ${dY}px, 0) rotate(${rotation}deg)`;
  
  // Show Stamps proportional to distance
  const stampWinA = cardEl.querySelector(".stamp-win-a");
  const stampWinB = cardEl.querySelector(".stamp-win-b");
  const stampDraw = cardEl.querySelector(".stamp-draw");
  
  // Reset stamp opacities
  if (stampWinA) stampWinA.style.opacity = 0;
  if (stampWinB) stampWinB.style.opacity = 0;
  if (stampDraw) stampDraw.style.opacity = 0;
  
  if (dX < -20) {
    // Drag left = Team A win (stamp appears top-right)
    if (stampWinA) stampWinA.style.opacity = Math.min(1, Math.abs(dX) / 100);
  } else if (dX > 20) {
    // Drag right = Team B win (stamp appears top-left)
    if (stampWinB) stampWinB.style.opacity = Math.min(1, dX / 100);
  } else if (dY < -20 && cachedActiveMatch.stage === "groups") {
    // Drag up = Draw (groups only)
    if (stampDraw) stampDraw.style.opacity = Math.min(1, Math.abs(dY) / 100);
  }
}

function dragEnd() {
  if (!isDragging || !cardEl || !cachedActiveMatch) return;
  
  isDragging = false;
  cardEl.classList.remove("dragging");
  
  document.removeEventListener("mousemove", dragMove);
  document.removeEventListener("touchmove", dragMove);
  document.removeEventListener("mouseup", dragEnd);
  document.removeEventListener("touchend", dragEnd);
  
  const matrix = new DOMMatrixReadOnly(getComputedStyle(cardEl).transform);
  let dX = matrix.m41;
  let dY = matrix.m42;
  
  const threshold = 110;
  
  if (dX < -threshold) {
    // Swipe Left -> Team A wins
    applySwipePrediction("win-a");
  } else if (dX > threshold) {
    // Swipe Right -> Team B wins
    applySwipePrediction("win-b");
  } else if (dY < -threshold && cachedActiveMatch.stage === "groups") {
    // Swipe Up (groups only) -> Draw
    applySwipePrediction("draw");
  } else {
    // Snap back spring animation
    cardEl.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.25)";
    resetSwipeCardTransform(cardEl);
    
    // Fade out stamps
    const stampWinA = cardEl.querySelector(".stamp-win-a");
    const stampWinB = cardEl.querySelector(".stamp-win-b");
    const stampDraw = cardEl.querySelector(".stamp-draw");
    if (stampWinA) stampWinA.style.opacity = 0;
    if (stampWinB) stampWinB.style.opacity = 0;
    if (stampDraw) stampDraw.style.opacity = 0;
  }
}

// --- 7. APPLY PREDICTIONS & BACKGROUND ROUTER ---
function applySwipePrediction(direction) {
  if (!cachedActiveMatch || cachedActiveMatch.stage === "completed") return;

  // PUSH Snapshot for Undo
  pushStateSnapshot();
  
  const card = document.querySelector(".swipe-card");
  
  if (cachedActiveMatch.stage === "groups") {
    const match = GROUP_STAGE_MATCHES[cachedActiveMatch.index];
    const key = `${match.group}_${match.matchIndex}`;
    const teamA = TEAMS_DB[match.teamA];
    const teamB = TEAMS_DB[match.teamB];
    
    if (direction === "win-a") {
      state.groupMatchScores[key] = TournamentStandings.groupOutcomeEntry("a");
      showToast(`${teamA.flag} ${teamA.name} Wins!`);
      animateSwipeExit(card, "win-a", () => proceedNextMatch());
    } else if (direction === "win-b") {
      state.groupMatchScores[key] = TournamentStandings.groupOutcomeEntry("b");
      showToast(`${teamB.flag} ${teamB.name} Wins!`);
      animateSwipeExit(card, "win-b", () => proceedNextMatch());
    } else if (direction === "draw") {
      state.groupMatchScores[key] = TournamentStandings.groupOutcomeEntry("d");
      showToast("🤝 Match Drawn!");
      animateSwipeExit(card, "draw", () => proceedNextMatch());
    }
  } else if (cachedActiveMatch.stage === "knockouts") {
    const mId = cachedActiveMatch.matchId;
    const matchInfo = KNOCKOUT_MATCHES[mId].resolve();
    const teamA = TEAMS_DB[matchInfo.a];
    const teamB = TEAMS_DB[matchInfo.b];
    
    if (direction === "win-a") {
      state.knockoutPicks[mId] = matchInfo.a;
      showToast(`${teamA.flag} ${teamA.name} Wins!`);
      animateSwipeExit(card, "win-a", () => proceedNextMatch());
    } else if (direction === "win-b") {
      state.knockoutPicks[mId] = matchInfo.b;
      showToast(`${teamB.flag} ${teamB.name} Wins!`);
      animateSwipeExit(card, "win-b", () => proceedNextMatch());
    } else if (direction === "draw") {
      // Knockout draws cannot happen! Bounce back and alert.
      showToast("Draws not allowed in Knockout matches!", true);
      historyStack.pop(); // Clear pushed snapshot since it bounced
      if (card) {
        card.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.25)";
        resetSwipeCardTransform(card);
        const stampDraw = card.querySelector(".stamp-draw");
        if (stampDraw) stampDraw.style.opacity = 0;
      }
    }
  }
}

function animateSwipeExit(card, dir, callback) {
  if (!card) {
    if (callback) callback();
    return;
  }
  
  // Force stamp highlight
  const stamp = card.querySelector(`.stamp-${dir}`);
  if (stamp) stamp.style.opacity = 1;
  
  card.style.transition = "transform 0.35s ease-in";
  
  if (dir === "win-a") {
    card.classList.add("swipe-out-left");
  } else if (dir === "win-b") {
    card.classList.add("swipe-out-right");
  } else if (dir === "draw") {
    card.classList.add("swipe-out-up");
  }
  
  setTimeout(() => {
    if (callback) callback();
  }, 350);
}

function proceedNextMatch() {
  // A. Recalculate standings background math
  recalculateStandings();
  
  // B. Save to storage
  saveToLocalStorage();
  
  // C. Update Cache and Render next card
  refreshActiveMatchCache();
  renderActiveCardDeck();
}

// --- 7.5. ELO PROBABILISTIC AUTOMATED STAGE SIMULATOR ---
function simulateStageProbabilistic() {
  if (!cachedActiveMatch || cachedActiveMatch.stage === "completed") {
    showToast("Simulation already completed!", true);
    return;
  }

  // PUSH Snapshot for Undo - one snapshot for the entire simulated round!
  pushStateSnapshot();

  let simulatedCount = 0;
  let stageLabel = "";

  if (cachedActiveMatch.stage === "groups") {
    stageLabel = "Group Stage";
    // Simulate from current active group match index to Match 72 (index 71)
    for (let i = cachedActiveMatch.index; i < 72; i++) {
      const match = GROUP_STAGE_MATCHES[i];
      const key = `${match.group}_${match.matchIndex}`;
      
      const teamA = TEAMS_DB[match.teamA];
      const teamB = TEAMS_DB[match.teamB];
      if (!teamA || !teamB) continue;

      const d = teamB.rank - teamA.rank; // Difference in FIFA Ranks (smaller rank number is better)
      
      // ELO/Ranking Probabilistic Win/Draw/Loss formula
      let pA = 0.45 + (d / 120);
      pA = Math.max(0.15, Math.min(0.75, pA)); // Clamped
      const pDraw = 0.22;
      
      const r = Math.random();
      let outcome;
      if (r < pA) outcome = "a";
      else if (r < pA + pDraw) outcome = "d";
      else outcome = "b";

      state.groupMatchScores[key] = TournamentStandings.groupOutcomeEntry(outcome);
      simulatedCount++;
    }
  } else if (cachedActiveMatch.stage === "knockouts") {
    const activeId = cachedActiveMatch.matchId;
    let rangeStart = activeId;
    let rangeEnd = 104;

    if (activeId >= 73 && activeId <= 88) { rangeEnd = 88; stageLabel = "Round of 32"; }
    else if (activeId >= 89 && activeId <= 96) { rangeEnd = 96; stageLabel = "Round of 16"; }
    else if (activeId >= 97 && activeId <= 100) { rangeEnd = 100; stageLabel = "Quarter-finals"; }
    else if (activeId >= 101 && activeId <= 102) { rangeEnd = 102; stageLabel = "Semi-finals"; }
    else if (activeId >= 103 && activeId <= 104) { rangeEnd = 104; stageLabel = "Finals"; }

    // Run standings/wildcards math first to ensure clean knockout resolution in consecutive steps
    recalculateStandings();

    for (let mId = rangeStart; mId <= rangeEnd; mId++) {
      const match = KNOCKOUT_MATCHES[mId];
      const resolved = match.resolve();
      
      let teamAId = resolved.a;
      let teamBId = resolved.b;

      // Safe fallbacks to prevent crash if somehow undefined
      if (!teamAId || !teamBId) {
        const allKeys = Object.keys(TEAMS_DB);
        if (!teamAId) teamAId = allKeys[Math.floor(Math.random() * allKeys.length)];
        if (!teamBId) {
          do {
            teamBId = allKeys[Math.floor(Math.random() * allKeys.length)];
          } while (teamBId === teamAId);
        }
      }

      const teamA = TEAMS_DB[teamAId];
      const teamB = TEAMS_DB[teamBId];

      const d = teamB.rank - teamA.rank;
      let pA = 0.45 + (d / 120);
      pA = Math.max(0.15, Math.min(0.75, pA)); // Clamped
      
      const r = Math.random();
      const pick = r < pA ? teamAId : teamBId;
      state.knockoutPicks[mId] = pick;
      simulatedCount++;
    }
  }

  // Recalculate standings, update local storage, refresh cache & render
  recalculateStandings();
  saveToLocalStorage();
  refreshActiveMatchCache();
  renderActiveCardDeck();

  showToast(`⚡ ${stageLabel}: ${simulatedCount} matches simulated!`);
}

// --- 7.6. PERSONALIZATION HELPERS ---
function updateHeaderTitle() {
  if (!DOM.appHeaderTitle) return;
  if (state.userName) {
    const name = state.userName;
    const title = name.endsWith("s") ? `${name}'` : `${name}'s`;
    DOM.appHeaderTitle.innerText = `${title} Prediction`;
  } else {
    DOM.appHeaderTitle.innerText = APP_TITLE_DEFAULT;
  }
}

// --- 8. UNDO ENGINE (POP SNAPSHOTS) ---
function triggerUndo() {
  const popped = popStateSnapshot();
  if (popped) {
    saveToLocalStorage();
    recalculateStandings();
    refreshActiveMatchCache();
    renderActiveCardDeck();
    showToast("Prediction undone!");
  } else {
    showToast("Nothing to undo!", true);
  }
}

// --- 9. RENDER GESTURE MATCH CARD ---
function renderActiveCardDeck() {
  if (!cachedActiveMatch) {
    refreshActiveMatchCache();
  }
  
  // A. Check if welcome screen is active
  if (state.wizardStep === "welcome") {
    if (DOM.paneSwipeWelcome) DOM.paneSwipeWelcome.classList.remove("hidden");
    DOM.paneSwipeDeck.classList.add("hidden");
    DOM.paneSwipePodium.classList.add("hidden");
    setDeckActiveMode(false);
    updateHeaderTitle();
    void renderLeaderboard();
    return;
  } else {
    if (DOM.paneSwipeWelcome) DOM.paneSwipeWelcome.classList.add("hidden");
  }
  
  // B. Check if completed simulation or in share viewer mode!
  if (state.isViewer || cachedActiveMatch.stage === "completed") {
    revealPodiumChampionship();
    return;
  }

  DOM.paneSwipeDeck.classList.remove("hidden");
  DOM.paneSwipePodium.classList.add("hidden");
  setDeckActiveMode(true);
  showSwipeIntroIfNeeded();

  DOM.cardDeckContainer.innerHTML = "";
  
  // Define progress bars
  const totalMatches = 104;
  let currentProgressId = cachedActiveMatch.matchId - 1;
  let percent = Math.round((currentProgressId / totalMatches) * 100);
  if (DOM.progressBarFill) {
    DOM.progressBarFill.style.width = `${percent}%`;
  }

  if (cachedActiveMatch.stage === "groups") {
    DOM.stepperStageTitle.innerText = "GROUP STAGE";
    DOM.stepperMatchProgress.innerText = `Match ${cachedActiveMatch.matchId} of 72`;
    DOM.btnChoiceUp.classList.remove("hidden");
    DOM.kbdDrawItem.classList.remove("hidden");
    updateSwipeIntroForStage();

    const match = GROUP_STAGE_MATCHES[cachedActiveMatch.index];
    const teamA = TEAMS_DB[match.teamA];
    const teamB = TEAMS_DB[match.teamB];
    
    // Update button Microflags
    DOM.btnFlagA.innerText = teamA.flag;
    DOM.btnFlagB.innerText = teamB.flag;

    const card = document.createElement("div");
    card.className = "swipe-card glass-panel";
    card.innerHTML = `
      <!-- Stamps -->
      <div class="swipe-stamp stamp-win-a">${teamA.flag} ${teamA.name}</div>
      <div class="swipe-stamp stamp-win-b">${teamB.name} ${teamB.flag}</div>
      <div class="swipe-stamp stamp-draw">🤝 Level</div>

      <div class="card-header-stage">
        <span class="card-stage-meta">GROUP ${match.group} &bull; MATCH ${cachedActiveMatch.matchId}</span>
        <span class="card-stage-title">Group Stage Prediction</span>
      </div>

      <div class="card-vs-body">
        <div class="card-team-panel">
          <span class="card-team-flag">${teamA.flag}</span>
          <span class="card-team-name">${teamA.name}</span>
          <span class="card-team-rank">FIFA Rank: <span>#${teamA.rank}</span></span>
        </div>

        <div class="card-vs-divider">
          <div class="vs-line"></div>
          <span class="vs-stamp">VS</span>
          <div class="vs-line"></div>
        </div>

        <div class="card-team-panel">
          <span class="card-team-flag">${teamB.flag}</span>
          <span class="card-team-name">${teamB.name}</span>
          <span class="card-team-rank">FIFA Rank: <span>#${teamB.rank}</span></span>
        </div>
      </div>

      <div class="card-team-stars">
        <span class="card-insights-label">MATCH INSIGHTS</span>
        ${teamA.name} (${teamA.stars[0]}) vs ${teamB.name} (${teamB.stars[0]}). ${teamA.history.split(".")[0]}.
      </div>
    `;
    DOM.cardDeckContainer.appendChild(card);
    bindSwipeGestures(card);
  } else if (cachedActiveMatch.stage === "knockouts") {
    const mId = cachedActiveMatch.matchId;
    const match = KNOCKOUT_MATCHES[mId];
    const resolved = match.resolve();
    
    // Safety check team resolutions
    if (!resolved.a || !resolved.b) {
      DOM.cardDeckContainer.innerHTML = `
        <div class="swipe-card-placeholder glass-panel text-center">
          <i class="fa-solid fa-triangle-exclamation placeholder-spinner" style="color: var(--crimson-500);"></i>
          <p>${ERROR_KICKOFF_MSG}</p>
        </div>
      `;
      return;
    }
    
    const teamA = TEAMS_DB[resolved.a];
    const teamB = TEAMS_DB[resolved.b];

    DOM.stepperStageTitle.innerText = getKnockoutRoundTitle(mId);
    DOM.stepperMatchProgress.innerText = `Match ${cachedActiveMatch.matchId} of 104`;
    DOM.btnChoiceUp.classList.add("hidden");
    DOM.kbdDrawItem.classList.add("hidden");
    updateSwipeIntroForStage();

    DOM.btnFlagA.innerText = teamA.flag;
    DOM.btnFlagB.innerText = teamB.flag;

    const card = document.createElement("div");
    card.className = "swipe-card glass-panel";
    card.innerHTML = `
      <!-- Stamps -->
      <div class="swipe-stamp stamp-win-a">${teamA.flag} ADVANCES</div>
      <div class="swipe-stamp stamp-win-b">ADVANCES ${teamB.flag}</div>

      <div class="card-header-stage">
        <span class="card-stage-meta">${getKnockoutRoundTitle(mId)} &bull; MATCH ${mId}</span>
        <span class="card-stage-title">Knockout Stage Duel</span>
      </div>

      <div class="card-vs-body">
        <div class="card-team-panel">
          <span class="card-team-flag">${teamA.flag}</span>
          <span class="card-team-name">${teamA.name}</span>
          <span class="card-team-rank">FIFA Rank: <span>#${teamA.rank}</span></span>
        </div>

        <div class="card-vs-divider">
          <div class="vs-line"></div>
          <span class="vs-stamp">VS</span>
          <div class="vs-line"></div>
        </div>

        <div class="card-team-panel">
          <span class="card-team-flag">${teamB.flag}</span>
          <span class="card-team-name">${teamB.name}</span>
          <span class="card-team-rank">FIFA Rank: <span>#${teamB.rank}</span></span>
        </div>
      </div>

      <div class="card-team-stars" style="border: 1px solid rgba(245, 158, 11, 0.15);">
        <span style="color: var(--gold-400);">CRITICAL KNOCKOUT ROUND</span>
        Single game elimination. Winner advances straight to next stage!
      </div>
    `;
    DOM.cardDeckContainer.appendChild(card);
    bindSwipeGestures(card);
  }
}

function getKnockoutRoundTitle(mId) {
  if (mId >= 73 && mId <= 88) return "ROUND OF 32";
  if (mId >= 89 && mId <= 96) return "ROUND OF 16";
  if (mId >= 97 && mId <= 100) return "QUARTER-FINALS";
  if (mId >= 101 && mId <= 102) return "SEMI-FINALS";
  if (mId === 103) return "3RD PLACE PLAY-OFF";
  if (mId === 104) return "GRAND FINAL";
  return "KNOCKOUT STAGE";
}

function formatUpsetLine(winnerId, loserId) {
  const winner = TEAMS_DB[winnerId];
  const loser = TEAMS_DB[loserId];
  if (!winner || !loser) return null;
  return `${winner.flag} ${winner.name} beat ${loser.flag} ${loser.name}`;
}

function formatClosestLine(teamAId, teamBId) {
  const a = TEAMS_DB[teamAId];
  const b = TEAMS_DB[teamBId];
  if (!a || !b) return null;
  return `${a.flag} ${a.name} vs ${b.flag} ${b.name}`;
}

function collectPredictedMatchups() {
  const matchups = [];

  GROUP_STAGE_MATCHES.forEach((m) => {
    const key = `${m.group}_${m.matchIndex}`;
    const outcome = TournamentStandings.normalizeGroupOutcome(state.groupMatchScores[key]);
    if (!outcome) return;

    const rA = TEAMS_DB[m.teamA].rank;
    const rB = TEAMS_DB[m.teamB].rank;
    const rankGap = Math.abs(rA - rB);

    if (outcome === "d") {
      matchups.push({ type: "draw", teamA: m.teamA, teamB: m.teamB, rankGap });
      return;
    }

    const winner = outcome === "a" ? m.teamA : m.teamB;
    const loser = outcome === "a" ? m.teamB : m.teamA;
    const rWin = TEAMS_DB[winner].rank;
    const rLose = TEAMS_DB[loser].rank;
    const upsetGap = rWin > rLose ? rWin - rLose : 0;
    matchups.push({ type: "result", winner, loser, teamA: m.teamA, teamB: m.teamB, rankGap, upsetGap });
  });

  for (let mId = 73; mId <= 104; mId++) {
    const pick = state.knockoutPicks[mId];
    const resolved = KNOCKOUT_MATCHES[mId].resolve();
    if (!pick || !resolved.a || !resolved.b) continue;

    const winner = pick;
    const loser = pick === resolved.a ? resolved.b : resolved.a;
    const rWin = TEAMS_DB[winner].rank;
    const rLose = TEAMS_DB[loser].rank;
    matchups.push({
      type: "result",
      winner,
      loser,
      teamA: resolved.a,
      teamB: resolved.b,
      rankGap: Math.abs(rWin - rLose),
      upsetGap: rWin > rLose ? rWin - rLose : 0
    });
  }

  return matchups;
}

/** Biggest underdog win; if none, the tightest rank gap between opponents. */
function findPodiumMatchupHighlight() {
  const matchups = collectPredictedMatchups();
  if (!matchups.length) {
    return { label: "Shock of the Tournament", line: "—" };
  }

  let bestUpset = null;
  let closest = null;

  matchups.forEach((m) => {
    if (m.type === "result" && m.upsetGap > 0) {
      if (!bestUpset || m.upsetGap > bestUpset.upsetGap) bestUpset = m;
    }
    if (!closest || m.rankGap < closest.rankGap) closest = m;
  });

  if (bestUpset) {
    return {
      label: "Shock of the Tournament",
      line: formatUpsetLine(bestUpset.winner, bestUpset.loser) || "—"
    };
  }

  if (closest.type === "draw") {
    return {
      label: "Closest Matchup",
      line: formatClosestLine(closest.teamA, closest.teamB) || "—"
    };
  }

  return {
    label: "Closest Matchup",
    line: formatUpsetLine(closest.winner, closest.loser) || formatClosestLine(closest.teamA, closest.teamB) || "—"
  };
}

function updatePodiumMatchupHighlight() {
  const { label, line } = findPodiumMatchupHighlight();
  if (DOM.quickUpsetTitle) {
    DOM.quickUpsetTitle.innerHTML = `<i class="fa-solid fa-bolt text-gold-glow"></i> ${label}`;
  }
  if (DOM.quickUpsetMatch) {
    DOM.quickUpsetMatch.innerText = line;
  }
}

function calculateChaosScore() {
  const results = collectPredictedMatchups().filter((m) => m.type === "result");
  if (!results.length) return 0;
  const upsets = results.filter((m) => m.upsetGap > 0).length;
  return Math.round((upsets / results.length) * 100);
}

function getChampionGroupLetter(champId) {
  for (const g of Object.keys(state.groupStandings)) {
    if (state.groupStandings[g] && state.groupStandings[g].includes(champId)) {
      return g;
    }
  }
  return null;
}

function getKnockoutPathLabel(mId) {
  if (mId >= 73 && mId <= 88) return "Round of 32";
  if (mId >= 89 && mId <= 96) return "Round of 16";
  if (mId >= 97 && mId <= 100) return "Quarter-final";
  if (mId >= 101 && mId <= 102) return "Semi-final";
  if (mId === 104) return "Final";
  return "Knockout";
}

function buildChampionPath(champId) {
  if (!champId || !TEAMS_DB[champId]) return [];

  const steps = [];
  const groupLetter = getChampionGroupLetter(champId);
  steps.push({
    label: "Group Stage",
    detail: groupLetter ? `Group ${groupLetter}` : "Qualified"
  });

  for (let mId = 73; mId <= 104; mId++) {
    if (mId === 103) continue;
    if (state.knockoutPicks[mId] !== champId) continue;
    const resolved = KNOCKOUT_MATCHES[mId].resolve();
    if (!resolved.a || !resolved.b) continue;
    const opponentId = resolved.a === champId ? resolved.b : resolved.a;
    const opp = TEAMS_DB[opponentId];
    steps.push({
      label: getKnockoutPathLabel(mId),
      detail: opp ? `vs ${opp.name}` : ""
    });
  }
  return steps;
}

function formatChampionPathText(champId) {
  const champ = TEAMS_DB[champId];
  if (!champ) return "—";
  const steps = buildChampionPath(champId);
  if (!steps.length) return "—";
  const parts = steps.map((s) => (s.detail ? `${s.label} ${s.detail}` : s.label));
  return `${champ.name}'s route:\n${parts.join(" → ")}`;
}

function updatePodiumSignaturePanels(champId) {
  const chaos = calculateChaosScore();
  if (DOM.podiumChaosValue) {
    DOM.podiumChaosValue.textContent = `${chaos}%`;
  }
  if (DOM.podiumChaosPanel) {
    DOM.podiumChaosPanel.classList.toggle("hidden", state.isViewer);
  }

  if (DOM.pathToGloryRoute) {
    const pathText = formatChampionPathText(champId);
    DOM.pathToGloryRoute.textContent = pathText.replace(/\n/g, " ");
    DOM.pathToGloryRoute.setAttribute("title", pathText);
  }
}

// --- 10. CHAMPIONSHIP REVEAL & CTA ---
function revealPodiumChampionship() {
  if (DOM.paneSwipeWelcome) DOM.paneSwipeWelcome.classList.add("hidden");
  DOM.paneSwipeDeck.classList.add("hidden");
  DOM.paneSwipePodium.classList.remove("hidden");
  setDeckActiveMode(false);
  hideSwipeIntro();
  
  // Set championship step for shared compatibility
  state.wizardStep = "championship";
  if (!state.isViewer) {
    saveToLocalStorage();
  } else {
    clearSwipeProgressStorage();
  }
  updateHeaderTitle();

  // Resolve Podium Winners
  const champId = state.knockoutPicks[104];
  const runnerId = champId === KNOCKOUT_MATCHES[104].resolve().a ? KNOCKOUT_MATCHES[104].resolve().b : KNOCKOUT_MATCHES[104].resolve().a;
  const thirdId = state.knockoutPicks[103];

  const champ = TEAMS_DB[champId];
  const runner = TEAMS_DB[runnerId];
  const third = TEAMS_DB[thirdId];

  if (champ) {
    DOM.finishFlag.innerText = champ.flag;
    DOM.finishName.innerText = champ.name.toUpperCase();
  }
  if (runner) {
    if (DOM.finishSilverFlag) DOM.finishSilverFlag.innerText = runner.flag;
    if (DOM.finishSilverName) DOM.finishSilverName.innerText = runner.name;
  }
  if (third) {
    if (DOM.finishBronzeFlag) DOM.finishBronzeFlag.innerText = third.flag;
    if (DOM.finishBronzeName) DOM.finishBronzeName.innerText = third.name;
  }

  updatePodiumMatchupHighlight();
  updatePodiumSignaturePanels(champId);

  if (typeof CelebrationEffects !== "undefined") {
    CelebrationEffects.triggerPodiumCelebration();
  }

  // Customizations for Share/Viewer Mode
  if (state.isViewer) {
    if (DOM.btnRestartSwipe) {
      DOM.btnRestartSwipe.innerHTML = `<i class="fa-solid fa-play"></i> Make Your Own Prediction`;
      DOM.btnRestartSwipe.className = "btn btn-gold btn-lg btn-block pulse-gold";
      DOM.btnRestartSwipe.style.padding = "14px";
      DOM.btnRestartSwipe.style.fontWeight = "700";
    }
    if (DOM.btnShareResults) DOM.btnShareResults.classList.add("hidden");
    if (DOM.btnUndo) DOM.btnUndo.classList.add("hidden");
    if (DOM.btnReset) DOM.btnReset.classList.add("hidden");
  } else {
    if (DOM.btnShareResults) DOM.btnShareResults.classList.remove("hidden");
    if (DOM.btnRestartSwipe) {
      DOM.btnRestartSwipe.innerHTML = `<i class="fa-solid fa-rotate-left"></i> Run it back`;
      DOM.btnRestartSwipe.className = "btn btn-secondary btn-sm";
      DOM.btnRestartSwipe.style.padding = "";
      DOM.btnRestartSwipe.style.fontWeight = "";
    }
    if (DOM.btnUndo) DOM.btnUndo.classList.remove("hidden");
    if (DOM.btnReset) DOM.btnReset.classList.remove("hidden");
  }
  void autoSavePredictionToLeaderboard();
}

function isLegacyKnockoutOnly() {
  const hasGroup = Object.keys(state.groupMatchScores).some((key) =>
    TournamentStandings.isEnteredGroupResult(state.groupMatchScores[key])
  );
  return !hasGroup && Object.keys(state.knockoutPicks).length > 0;
}

function showSwipePane(activePane) {
  [DOM.paneSwipeWelcome, DOM.paneSwipeDeck, DOM.paneSwipePodium, DOM.paneBracketView].forEach((pane) => {
    if (pane) pane.classList.add("hidden");
  });
  if (activePane) activePane.classList.remove("hidden");
}

function getBracketViewOptions() {
  return {
    teamsDb: TEAMS_DB,
    groupsData: GROUPS_DATA,
    groupStandings: state.groupStandings,
    groupMatchScores: state.groupMatchScores,
    groupMatchesFlat: GROUP_STAGE_MATCHES,
    legacyKnockoutOnly: isLegacyKnockoutOnly(),
    knockoutPicks: state.knockoutPicks,
    knockoutScores: state.knockoutScores,
    resolveMatch: (mId) => {
      if (!KNOCKOUT_MATCHES[mId]) return null;
      try {
        return KNOCKOUT_MATCHES[mId].resolve();
      } catch (err) {
        console.warn("Could not resolve match", mId, err);
        return null;
      }
    },
    getStandingStats: (gLetter, teamId) =>
      TournamentStandings.getTeamSummaryStats(gLetter, teamId, state.groupMatchScores)
  };
}

function renderSimpleBracketView() {
  recalculateStandings();
  const name = state.userName || "Prediction";
  const label = name.endsWith("s") ? `${name}'` : `${name}'s`;
  if (DOM.bracketViewTitle) {
    DOM.bracketViewTitle.textContent = state.isViewer ? `${label} bracket` : "Your bracket";
  }

  if (typeof BracketView === "undefined") return;

  const options = getBracketViewOptions();
  BracketView.renderKnockoutTree(DOM.bracketViewKnockout, options);
  BracketView.renderGroups(DOM.bracketViewGroups, options);

  if (DOM.btnBracketToggleGroups) {
    const legacy = isLegacyKnockoutOnly();
    DOM.btnBracketToggleGroups.classList.toggle("hidden", legacy);
    DOM.btnBracketToggleGroups.disabled = legacy;
  }
}

function showKnockoutBracketPanel() {
  DOM.bracketViewKnockout?.classList.remove("hidden");
  DOM.bracketViewGroups?.classList.add("hidden");
  if (DOM.btnBracketToggleGroups) {
    DOM.btnBracketToggleGroups.innerHTML = '<i class="fa-solid fa-table"></i> Group stage';
    DOM.btnBracketToggleGroups.dataset.view = "knockout";
  }
}

function showGroupStagePanel() {
  if (isLegacyKnockoutOnly()) {
    showToast("Group stage not included in this shared bracket.", true);
    return;
  }
  DOM.bracketViewKnockout?.classList.add("hidden");
  DOM.bracketViewGroups?.classList.remove("hidden");
  if (DOM.btnBracketToggleGroups) {
    DOM.btnBracketToggleGroups.innerHTML = '<i class="fa-solid fa-sitemap"></i> Bracket';
    DOM.btnBracketToggleGroups.dataset.view = "groups";
  }
}

function openBracketView() {
  renderSimpleBracketView();
  showKnockoutBracketPanel();
  showSwipePane(DOM.paneBracketView);
}

function enterViewerMode() {
  state.isViewer = true;
  document.body.classList.add("viewer-mode");
  recalculateStandings();
  revealPodiumChampionship();
  showSwipePane(DOM.paneSwipePodium);

  const params = new URLSearchParams(window.location.search);
  if (params.get("view") === "bracket") {
    openBracketView();
  }
}

async function tryLoadSharedOrSavedBracket() {
  const shareCode = typeof BracketShare !== "undefined" ? BracketShare.extractShareCodeFromPage() : null;
  if (shareCode) {
    const result = BracketShare.decodeShareCode(shareCode);
    if (result.ok) {
      BracketShare.applyPayloadToState(state, result.payload);
      enterViewerMode();
      showToast("Shared prediction loaded");
      return true;
    }
    showToast("Invalid share link", true);
    return true;
  }

  if (typeof SupabaseBracket !== "undefined" && SupabaseBracket.isConfigured()) {
    const nickname = SupabaseBracket.extractBracketNicknameFromPage();
    if (nickname) {
      const result = await SupabaseBracket.getBracket(nickname);
      if (result.ok) {
        BracketShare.applyPayloadToState(state, result.payload);
        if (!state.userName) state.userName = result.nickname;
        enterViewerMode();
        showToast(`Loaded @${result.nickname}'s bracket`);
        return true;
      }
      showToast("Bracket not found", true);
      return true;
    }
  }

  return false;
}

function getChampionBarColor(championLabel) {
  if (typeof TournamentData !== "undefined" && TournamentData.championBarColorFromLabel) {
    return TournamentData.championBarColorFromLabel(championLabel);
  }
  return null;
}

const CHAMPION_BAR_TOP_N = 6;

function aggregateChampionCounts(brackets) {
  if (typeof SupabaseBracket !== "undefined" && SupabaseBracket.aggregateChampionCounts) {
    return SupabaseBracket.aggregateChampionCounts(brackets, CHAMPION_BAR_TOP_N);
  }
  const list = brackets || [];
  const total = list.length;
  const counts = new Map();
  for (const row of list) {
    const key = (row.champion || "").trim() || "—";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([champion, count]) => ({
      champion,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count || a.champion.localeCompare(b.champion))
    .slice(0, CHAMPION_BAR_TOP_N);
}

function setChampionBarsMessage(message) {
  if (!DOM.leaderboardChampionBarsBody) return;
  DOM.leaderboardChampionBarsBody.innerHTML = "";
  const p = document.createElement("p");
  p.className = "sidebar-help-text champion-bars-msg";
  p.textContent = message;
  DOM.leaderboardChampionBarsBody.appendChild(p);
}

function renderChampionBars(aggregates) {
  if (!DOM.leaderboardChampionBarsBody) return;
  if (!aggregates || !aggregates.length) {
    setChampionBarsMessage("No champion picks yet — finish a run and save to appear here.");
    return;
  }

  const wrap = document.createElement("div");
  wrap.className = "champion-bars-table";
  wrap.setAttribute("role", "table");

  aggregates.forEach(({ champion, percent }) => {
    const row = document.createElement("div");
    row.className = "champion-bar-row";
    row.setAttribute("role", "row");

    const label = document.createElement("span");
    label.className = "champion-bar-label";
    label.setAttribute("role", "cell");
    label.textContent = champion;

    const trackCell = document.createElement("div");
    trackCell.className = "champion-bar-track";
    trackCell.setAttribute("role", "cell");
    const fill = document.createElement("div");
    fill.className = "champion-bar-fill";
    const barWidth = percent > 0 ? Math.max(percent, 6) : 0;
    fill.style.width = `${barWidth}%`;
    const barColor = getChampionBarColor(champion);
    if (barColor) {
      fill.style.background = barColor;
    } else {
      fill.classList.add("champion-bar-fill--default");
    }
    trackCell.appendChild(fill);

    const pctEl = document.createElement("span");
    pctEl.className = "champion-bar-pct";
    pctEl.setAttribute("role", "cell");
    pctEl.textContent = `${percent}%`;

    row.append(label, trackCell, pctEl);
    wrap.appendChild(row);
  });

  DOM.leaderboardChampionBarsBody.innerHTML = "";
  DOM.leaderboardChampionBarsBody.appendChild(wrap);
}

async function renderLeaderboard() {
  if (!DOM.leaderboardList) return;

  const configured = typeof SupabaseBracket !== "undefined" && SupabaseBracket.isConfigured();
  if (DOM.leaderboardUnconfigured) {
    DOM.leaderboardUnconfigured.classList.toggle("hidden", configured);
  }
  if (!configured) {
    DOM.leaderboardList.innerHTML = "";
    setChampionBarsMessage("Online saves are not configured — add Supabase keys to show community picks.");
    return;
  }

  setChampionBarsMessage("Loading champion picks…");
  DOM.leaderboardList.innerHTML = `<p class="sidebar-help-text" style="margin:8px 0 0;">${pickLoadingLine()}</p>`;
  const result = await SupabaseBracket.listBrackets();

  if (!result.ok) {
    DOM.leaderboardList.innerHTML = `<p class="save-share-error" style="margin:8px 0 0;">${ERROR_KICKOFF_MSG}</p>`;
    setChampionBarsMessage("Could not load champion picks. Try refresh.");
    return;
  }

  if (!result.brackets.length) {
    DOM.leaderboardList.innerHTML =
      '<p class="sidebar-help-text" style="margin:8px 0 0;">No predictions yet — be the first after you finish!</p>';
    setChampionBarsMessage("No champion picks yet — be the first after you finish!");
    return;
  }

  renderChampionBars(aggregateChampionCounts(result.brackets));

  DOM.leaderboardList.innerHTML = "";
  result.brackets.forEach((row) => {
    const href = SupabaseBracket.buildSubmittedBracketUrl(row.nickname);
    const timeLabel = row.updated_at
      ? new Date(row.updated_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })
      : "";
    const displayName =
      (row.payload && typeof row.payload.name === "string" && row.payload.name.trim()) ||
      row.nickname;
    const link = document.createElement("a");
    link.className = "leaderboard-row";
    link.href = href;
    const nickEl = document.createElement("span");
    nickEl.className = "leaderboard-nick";
    nickEl.textContent = displayName;
    const champEl = document.createElement("span");
    champEl.className = "leaderboard-champ";
    champEl.textContent = row.champion || "—";
    const main = document.createElement("div");
    main.className = "leaderboard-row-main";
    main.append(nickEl, champEl);
    const timeEl = document.createElement("span");
    timeEl.className = "leaderboard-time";
    timeEl.textContent = timeLabel;
    link.append(main, timeEl);
    DOM.leaderboardList.appendChild(link);
  });
}

function formatUpsetShareLine() {
  const { line } = findPodiumMatchupHighlight();
  if (!line || line === "—") return null;
  return line.replace(/ beat /i, " over ");
}

async function performShareResults(shareUrlOverride) {
  const champId = state.knockoutPicks[104];
  const finalResolved = KNOCKOUT_MATCHES[104].resolve();
  const runnerId =
    champId === finalResolved.a ? finalResolved.b : finalResolved.a;

  const champ = TEAMS_DB[champId];
  const runner = TEAMS_DB[runnerId];
  const chaos = calculateChaosScore();
  const upsetLine = formatUpsetShareLine();

  let shareUrl = shareUrlOverride || "";
  if (!shareUrl) {
    try {
      recalculateStandings();
      const payload = BracketShare.payloadFromSimulatorState(state);
      shareUrl = BracketShare.buildBracketViewUrl(payload, window.location.href);
    } catch (err) {
      console.error("Failed to generate share URL:", err);
      shareUrl = new URL("swipe.html", window.location.href).href;
    }
  }

  let text = "I just predicted the 2026 World Cup.\n\n";
  if (champ) text += `🏆 Champion: ${champ.name}\n`;
  if (runner) text += `🥈 Runner-up: ${runner.name}\n`;
  if (upsetLine) text += `🤯 Biggest upset: ${upsetLine}\n`;
  text += `🔥 Chaos score: ${chaos}%\n\n`;
  text += `Build yours:\n${shareUrl}`;

  const shareData = {
    title: "My 2026 World Cup prediction",
    text,
    url: shareUrl
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      showToast("Shared successfully!");
      return;
    } catch (err) {
      console.log("Share failed or cancelled", err);
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    showToast("📋 Results rundown copied to clipboard!");
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    showToast("Clipboard copy failed. Please copy manually.", true);
  }
}

function bindSharedAndPodiumHandlers() {
  if (DOM.btnViewBracket) {
    DOM.btnViewBracket.addEventListener("click", openBracketView);
  }

  if (DOM.btnBackFromBracket) {
    DOM.btnBackFromBracket.addEventListener("click", () => {
      if (DOM.btnBracketToggleGroups?.dataset.view === "groups") {
        showKnockoutBracketPanel();
        return;
      }
      showSwipePane(DOM.paneSwipePodium);
    });
  }

  if (DOM.btnBracketToggleGroups) {
    DOM.btnBracketToggleGroups.addEventListener("click", () => {
      if (DOM.btnBracketToggleGroups.dataset.view === "groups") {
        showKnockoutBracketPanel();
      } else {
        showGroupStagePanel();
      }
    });
  }

  if (DOM.btnRestartSwipe) {
    DOM.btnRestartSwipe.addEventListener("click", () => {
      if (state.isViewer) {
        window.location.href = new URL("swipe.html", window.location.href).pathname;
        return;
      }
      if (
        !confirm(
          "Start a new prediction? Your current progress will be cleared from this browser."
        )
      ) {
        return;
      }
      initDefaultState();
      refreshActiveMatchCache();
      renderActiveCardDeck();
      showToast("Ready for a new prediction!");
    });
  }

  if (DOM.btnShareResults) {
    DOM.btnShareResults.addEventListener("click", async () => {
      await performShareResults(null);
    });
  }

  if (DOM.btnRefreshLeaderboard) {
    DOM.btnRefreshLeaderboard.addEventListener("click", () => {
      void renderLeaderboard();
    });
  }
}

// --- 11. EVENT REGISTRATION DOMCONTENTLOADED ---
window.addEventListener("DOMContentLoaded", async () => {
  if (typeof SupabaseBracket !== "undefined") {
    SupabaseBracket.initSupabase();
  }

  if (shouldShowSwipeIntro()) {
    swipeIntroPending = true;
  }

  bindSharedAndPodiumHandlers();
  bindSwipeIntroHandlers();
  if (DOM.deckLoadingMsg) {
    DOM.deckLoadingMsg.textContent = pickLoadingLine();
  }
  void renderLeaderboard();

  if (await tryLoadSharedOrSavedBracket()) {
    return;
  }

  if (userRequestedFreshStart()) {
    initDefaultState();
    stripFreshStartParamsFromUrl();
  } else if (isSwipeSessionActive()) {
    const resume = tryRestoreSwipeProgress();
    if (resume.restored) {
      if (DOM.inputUserName && state.userName) {
        DOM.inputUserName.value = state.userName;
      }
    } else {
      if (resume.expired) {
        showToast("Your saved session expired — start a new prediction.");
      }
      beginWelcomeScreen();
    }
  } else {
    beginWelcomeScreen();
  }

  refreshActiveMatchCache();

  // Render Card
  renderActiveCardDeck();

  // Button Tap Controllers
  DOM.btnChoiceLeft.addEventListener("click", () => applySwipePrediction("win-a"));
  DOM.btnChoiceRight.addEventListener("click", () => applySwipePrediction("win-b"));
  
  if (DOM.btnChoiceUp) {
    DOM.btnChoiceUp.addEventListener("click", () => applySwipePrediction("draw"));
  }

  DOM.btnUndo.addEventListener("click", triggerUndo);
  
  if (DOM.btnSimulateStage) {
    DOM.btnSimulateStage.addEventListener("click", simulateStageProbabilistic);
  }
  
  DOM.btnReset.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset your swipe predictor? All predictions will be wiped.")) {
      initDefaultState();
      refreshActiveMatchCache();
      renderActiveCardDeck();
      showToast("Predictor fully reset!");
    }
  });

  // Welcome screen name registration
  if (DOM.btnStartPrediction) {
    DOM.btnStartPrediction.addEventListener("click", () => {
      if (!DOM.inputUserName) return;
      const nameVal = DOM.inputUserName.value.trim();
      if (!nameVal) {
        showToast("Please enter your name to start!", true);
        return;
      }
      state.userName = nameVal;
      state.wizardStep = "md1"; // Start with Group Stage matches
      markSwipeSessionActive();
      clearSwipeProgressStorage();
      queueSwipeIntro();
      saveToLocalStorage();
      updateHeaderTitle();
      renderActiveCardDeck();
      showSwipeIntro(true);
      showToast(`Kickoff, ${nameVal}!`);
    });
  }

  if (DOM.inputUserName) {
    DOM.inputUserName.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (DOM.btnStartPrediction) DOM.btnStartPrediction.click();
      }
    });
  }

  // KEYBOARD NAVIGATION SHORTCUTS
  window.addEventListener("keydown", (e) => {
    if (!cachedActiveMatch || cachedActiveMatch.stage === "completed") return;

    if (e.key === "ArrowLeft") {
      applySwipePrediction("win-a");
    } else if (e.key === "ArrowRight") {
      applySwipePrediction("win-b");
    } else if (e.key === "ArrowUp" && cachedActiveMatch.stage === "groups") {
      applySwipePrediction("draw");
    } else if (e.key === "Backspace") {
      triggerUndo();
    }
  });
});
