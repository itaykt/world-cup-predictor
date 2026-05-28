/**
 * FIFA World Cup 2026 Game-by-Game Simulation Wizard
 * Application Controller - Vanilla ES6
 */

// --- 1. WORLD CUP 2026 TEAMS & CONFIRMED GROUPS DRAW (see data.js) ---
const TEAMS_DB = TournamentData.TEAMS_DB;
const GROUPS_DATA = TournamentData.GROUPS_DATA;
const GROUP_STAGE_MATCHES = TournamentData.GROUP_STAGE_MATCHES_BY_MD;

// --- APPLICATION STATE ENGINE ---
let state = {
  // Current Wizard simulation step: 'welcome' | 'md1' | 'md2' | 'md3' | 'r32' | 'r16' | 'qf' | 'sf' | 'final' | 'championship'
  wizardStep: "welcome",
  
  // Group predictions: "groupLetter_matchIndex" -> { scoreA: num, scoreB: num }
  groupMatchScores: {},
  
  // Dynamic recomputed rankings per Group
  groupStandings: {}, // groupLetter -> ["teamId", ...]

  // Knockout Stage Predictions
  // matchId (73 to 104) -> { scoreA: num, scoreB: num, pWinner: teamId } (pWinner is shootout penalty decider if tie)
  knockoutScores: {},
  knockoutPicks: {}, // matchId -> winnerTeamId
  
  // Selected 8 Third-Place Wildcards (automatically calculated by standings, but saved in state)
  thirdPlaceQualifiers: [],

  // Goalscorers database: matchKey (e.g. "A_0" or "k_73") -> { teamA: [playerName, ...], teamB: [playerName, ...] }
  goalscorers: {},
  
  // Saved brackets snapshots: up to 3 saved states
  savedBrackets: [],
  
  // Loaded actual results for accuracy evaluation
  actualResults: null,
  
  // Anthropic API Key

  // Viewer read-only flag
  isViewer: false,

  // Display name (Swipe Cup + shared links)
  userName: ""
};

// --- INITIALIZE STATE ---
function initDefaultState() {
  state.wizardStep = "welcome";
  state.groupMatchScores = {};
  state.knockoutScores = {};
  state.knockoutPicks = {};
  state.thirdPlaceQualifiers = [];
  state.goalscorers = {};
  state.savedBrackets = [];
  state.actualResults = null;
  state.isViewer = false;
  state.userName = "";
  
  for (const group of Object.keys(GROUPS_DATA)) {
    state.groupStandings[group] = [...GROUPS_DATA[group]];
  }
}

// --- DOM CACHE ---
let DOM = {};

function initDOM() {
  DOM = {
  stepNodes: document.querySelectorAll(".step-node"),
  stepLines: document.querySelectorAll(".step-line"),
  
  // Panes
  panes: {
    welcome: document.getElementById("pane-welcome"),
    wizard: document.getElementById("pane-wizard"),
    championship: document.getElementById("pane-championship")
  },

  // Welcome Screen elements
  btnStartSimulation: document.getElementById("btn-start-simulation"),
  btnLoadJsonTrigger: document.getElementById("btn-load-json-trigger"),
  inputImportCode: document.getElementById("input-import-code"),
  btnImportCode: document.getElementById("btn-import-code"),
  txtProgGroup: document.getElementById("txt-prog-group"),
  txtProgKnockout: document.getElementById("txt-prog-knockout"),
  barProgGroup: document.getElementById("bar-prog-group"),
  barProgKnockout: document.getElementById("bar-prog-knockout"),
  champSpotlight: document.getElementById("champ-spotlight"),
  champSpotlightFilled: document.getElementById("champ-spotlight-filled"),
  champFlag: document.getElementById("champ-flag"),
  champName: document.getElementById("champ-name"),
  btnSpotlightShare: document.getElementById("btn-spotlight-share"),

  // Stepper controls
  btnShowLeaderboard: document.getElementById("btn-show-leaderboard"),
  btnShowFullBracket: document.getElementById("btn-show-full-bracket"),
  btnReset: document.getElementById("btn-reset"),
  leaderboardSection: document.getElementById("leaderboard-section"),
  leaderboardList: document.getElementById("leaderboard-list"),
  leaderboardUnconfigured: document.getElementById("leaderboard-unconfigured"),
  btnRefreshLeaderboard: document.getElementById("btn-refresh-leaderboard"),

  // Wizard active workspace
  lblActiveRoundTag: document.getElementById("lbl-active-round-tag"),
  lblActiveRoundTitle: document.getElementById("lbl-active-round-title"),
  btnClearStage: document.getElementById("btn-clear-stage"),
  btnQuickFillStage: document.getElementById("btn-quick-fill-stage"),
  btnNextStage: document.getElementById("btn-next-stage"),
  matchScorecardList: document.getElementById("match-scorecard-list"),

  // Sidebar standings
  sidebarGroupsGrid: document.getElementById("sidebar-groups-grid"),
  sidebarWildcardTbody: document.getElementById("sidebar-wildcard-tbody"),
  stabBtnGroups: document.getElementById("stab-btn-groups"),
  stabBtnWildcards: document.getElementById("stab-btn-wildcards"),
  stabContentGroups: document.getElementById("stab-content-groups"),
  stabContentWildcards: document.getElementById("stab-content-wildcards"),
  stabBtnDifficulty: document.getElementById("stab-btn-difficulty"),
  stabContentDifficulty: document.getElementById("stab-content-difficulty"),
  difficultyChartList: document.getElementById("difficulty-chart-list"),

  // Championship Podium pane
  finishFlag: document.getElementById("finish-flag"),
  finishName: document.getElementById("finish-name"),
  finishSilverName: document.getElementById("finish-silver-name"),
  finishBronzeName: document.getElementById("finish-bronze-name"),
  btnPodiumSaveShare: document.getElementById("btn-podium-save-share"),
  btnPodiumShareFinal: document.getElementById("btn-podium-share-final"),
  btnPodiumDownloadPoster: document.getElementById("btn-podium-download-poster"),
  btnStartOver: document.getElementById("btn-start-over"),
  statTotalGoals: document.getElementById("stat-total-goals"),
  statAvgGoals: document.getElementById("stat-avg-goals"),
  upsetMatchRow: document.getElementById("upset-match-row"),
  goldenBootTbody: document.getElementById("golden-boot-tbody"),

  // Footer Actions
  btnFooterShare: document.getElementById("btn-footer-share"),
  btnFooterDownload: document.getElementById("btn-footer-download"),

  // Bracket modal
  bracketModal: document.getElementById("bracket-modal"),
  btnCloseBracket: document.getElementById("btn-close-bracket"),
  bracketViewport: document.getElementById("bracket-viewport"),
  bracketCanvas: document.getElementById("bracket-canvas"),
  btnModalZoomIn: document.getElementById("btn-modal-zoom-in"),
  btnModalZoomOut: document.getElementById("btn-modal-zoom-out"),
  btnModalZoomReset: document.getElementById("btn-modal-zoom-reset"),
  treeChampionBadge: document.getElementById("tree-champion-badge"),
  treeChampFlag: document.getElementById("tree-champ-flag"),
  treeChampName: document.getElementById("tree-champ-name"),

  // Share link modal
  shareModal: document.getElementById("share-modal"),
  btnCloseShare: document.getElementById("btn-close-share"),
  txtShareLink: document.getElementById("txt-share-link"),
  btnCopyLink: document.getElementById("btn-copy-link"),
  btnDownloadJson: document.getElementById("btn-download-json"),
  btnModalDownloadImage: document.getElementById("btn-modal-download-image"),

  saveShareModal: document.getElementById("save-share-modal"),
  btnCloseSaveShare: document.getElementById("btn-close-save-share"),
  saveShareFormPanel: document.getElementById("save-share-form-panel"),
  saveShareSuccessPanel: document.getElementById("save-share-success-panel"),
  inputSaveNickname: document.getElementById("input-save-nickname"),
  inputSavePin: document.getElementById("input-save-pin"),
  saveShareError: document.getElementById("save-share-error"),
  btnSubmitSaveShare: document.getElementById("btn-submit-save-share"),
  txtSaveShareLink: document.getElementById("txt-save-share-link"),
  btnCopySaveShareLink: document.getElementById("btn-copy-save-share-link"),
  btnSaveShareDone: document.getElementById("btn-save-share-done"),

  // General Notification Banner
  toastEl: document.getElementById("toast-el"),
  toastMsg: document.getElementById("toast-msg"),
  sharedBracketFooter: document.getElementById("shared-bracket-footer"),
  sharedBracketTitle: document.getElementById("shared-bracket-title"),
  appContainer: document.getElementById("app-container"),

  // Settings modal
  btnShowSettings: document.getElementById("btn-show-settings"),
  settingsModal: document.getElementById("settings-modal"),
  btnCloseSettings: document.getElementById("btn-close-settings"),
  txtApiKey: document.getElementById("txt-api-key"),
  btnSaveSettings: document.getElementById("btn-save-settings"),
  btnClearSettings: document.getElementById("btn-clear-settings"),

  // Bracket Compare Modal
  btnCompareBrackets: document.getElementById("btn-compare-brackets"),
  compareModal: document.getElementById("compare-modal"),
  btnCloseCompare: document.getElementById("btn-close-compare"),
  compareTbody: document.getElementById("compare-tbody"),

  // Prediction Accuracy Tracker
  btnLoadActualDemo: document.getElementById("btn-load-actual-demo"),
  btnUploadActualTrigger: document.getElementById("btn-upload-actual-trigger"),
  fileActualResults: document.getElementById("file-actual-results"),
  accuracySummaryBox: document.getElementById("accuracy-summary-box"),
  btnClearActuals: document.getElementById("btn-clear-actuals"),
  btnViewAccuracyBreakdown: document.getElementById("btn-view-accuracy-breakdown"),
  accuracyModal: document.getElementById("accuracy-modal"),
  btnCloseAccuracy: document.getElementById("btn-close-accuracy"),
  accuracyTbody: document.getElementById("accuracy-tbody"),
  accScore: document.getElementById("acc-score"),
  accExact: document.getElementById("acc-exact"),
  accWinners: document.getElementById("acc-winners")
  };
}

// --- TOAST NOTIFICATIONS ---
function showToast(message, isError = false) {
  DOM.toastMsg.innerText = message;
  DOM.toastEl.style.background = isError ? "rgba(239, 68, 68, 0.95)" : "rgba(16, 185, 129, 0.95)";
  DOM.toastEl.classList.remove("hidden");
  setTimeout(() => {
    DOM.toastEl.classList.add("hidden");
  }, 3000);
}


function getAnthropicKey() {
  return localStorage.getItem("anthropic_key") || "";
}

function setAnthropicKey(key) {
  if (key) localStorage.setItem("anthropic_key", key);
  else localStorage.removeItem("anthropic_key");
}

// --- STATE STORAGE ---
function saveToLocalStorage() {
  if (state.isViewer) return;
  localStorage.setItem("wc_2026_simulator_save", JSON.stringify(state));
}

function loadFromLocalStorage() {
  const save = localStorage.getItem("wc_2026_simulator_save");
  if (save) {
    try {
      const data = JSON.parse(save);
      state.wizardStep = data.wizardStep || "welcome";
      state.userName = data.userName || "";
      state.groupMatchScores = data.groupMatchScores || {};
      state.knockoutScores = data.knockoutScores || {};
      state.knockoutPicks = data.knockoutPicks || {};
      state.thirdPlaceQualifiers = data.thirdPlaceQualifiers || [];
      state.groupStandings = data.groupStandings || {};
      state.goalscorers = data.goalscorers || {};
      state.savedBrackets = data.savedBrackets || [];
      state.actualResults = data.actualResults || null;
      
      // Safety check standings integrity
      for (const group of Object.keys(GROUPS_DATA)) {
        if (!state.groupStandings[group]) {
          state.groupStandings[group] = [...GROUPS_DATA[group]];
        }
      }
      return true;
    } catch (e) {
      console.error("Local storage read failure:", e);
    }
  }
  return false;
}

// --- 2. STEP-BY-STEP SIMULATOR WIZARD STATE CONTROLLER ---
function switchWizardStep(stepId) {
  state.wizardStep = stepId;
  saveToLocalStorage();

  // A. Update Timeline Header Node highlights
  let hitActive = false;
  DOM.stepNodes.forEach((node, idx) => {
    const sId = node.dataset.step;
    node.className = "step-node";
    
    if (sId === stepId) {
      node.classList.add("active");
      hitActive = true;
    } else if (!hitActive) {
      node.classList.add("completed");
    }
    
    // Line highlight matches node progression
    const line = DOM.stepLines[idx];
    if (line) {
      line.className = "step-line";
      if (!hitActive && sId !== stepId) {
        line.classList.add("completed");
      }
    }
  });

  // B. Pane routing
  Object.values(DOM.panes).forEach(pane => pane.classList.remove("active"));
  
  if (stepId === "welcome") {
    DOM.panes.welcome.classList.add("active");
    updateWelcomeScreenStats();
  } else if (stepId === "championship") {
    DOM.panes.championship.classList.add("active");
    renderChampionshipScreen();
  } else {
    // Standard Wizard feed mode
    DOM.panes.wizard.classList.add("active");
    
    // Set headers
    const titles = {
      md1: { round: "GROUP STAGE", title: "Matchday 1 (24 Games)" },
      md2: { round: "GROUP STAGE", title: "Matchday 2 (24 Games)" },
      md3: { round: "GROUP STAGE", title: "Matchday 3 (24 Games)" },
      r32: { round: "KNOCKOUT ROUND OF 32", title: "Matches 73 to 88 (16 Games)" },
      r16: { round: "KNOCKOUT ROUND OF 16", title: "Matches 89 to 96 (8 Games)" },
      qf: { round: "KNOCKOUT QUARTER-FINALS", title: "Matches 97 to 100 (4 Games)" },
      sf: { round: "KNOCKOUT SEMI-FINALS", title: "Matches 101 to 102 (2 Games)" },
      final: { round: "GRAND FINALS", title: "Championship Final & 3rd Play-off" }
    };

    DOM.lblActiveRoundTag.innerText = titles[stepId].round;
    DOM.lblActiveRoundTitle.innerText = titles[stepId].title;
    
    // Recompute standings
    recalculateAllGroupStandings();
    
    // Render Workspace Match Cards list & Standings Grid
    renderWizardMatchFeed();
    renderSidebarStandings();
  }
}

// --- 3. DYNAMIC REAL-TIME STANDINGS CALCULATOR ---
function recalculateAllGroupStandings() {
  const result = TournamentStandings.recalculate(state.groupMatchScores);
  state.groupStandings = result.groupStandings;
  state.thirdPlaceQualifiers = result.thirdPlaceQualifiers;
}

function calculateThirdPlacedList() {
  return TournamentStandings.calculateThirdPlacedList(state.groupMatchScores, state.groupStandings);
}

function getAccumulatedStats(groupLetter, teamId) {
  return TournamentStandings.getTeamSummaryStats(groupLetter, teamId, state.groupMatchScores);
}

function renderSidebarStandings() {
  DOM.sidebarGroupsGrid.innerHTML = "";

  Object.keys(GROUPS_DATA).forEach(gLetter => {
    const card = document.createElement("div");
    card.className = "mini-group-card";
    const danger = calculateGroupDangerMeter(gLetter);
    card.innerHTML = `
      <div class="mini-group-header">
        <h4>Group ${gLetter}</h4>
        <span class="danger-meter-badge ${danger.badgeClass}" title="Competitiveness: ${danger.score}/99 - ${danger.label}">
          <i class="fa-solid ${danger.icon}"></i> ${danger.score}
        </span>
      </div>
    `;

    const table = document.createElement("table");
    table.className = "compact-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th style="width: 20px;">#</th>
          <th>Team</th>
          <th class="stat">GD</th>
          <th class="stat">Pts</th>
        </tr>
      </thead>
      <tbody id="sidebar-tbody-g${gLetter}"></tbody>
    `;

    card.appendChild(table);
    DOM.sidebarGroupsGrid.appendChild(card);

    const tbody = document.getElementById(`sidebar-tbody-g${gLetter}`);
    const standings = state.groupStandings[gLetter];

    standings.forEach((teamId, idx) => {
      const team = TEAMS_DB[teamId];
      const tr = document.createElement("tr");
      if (idx < 2) tr.className = "qualify-yes";

      const rowStats = getAccumulatedStats(gLetter, teamId);

      tr.innerHTML = `
        <td><strong>${idx + 1}</strong></td>
        <td>
          <div class="mini-team-row">
            <span class="mini-team-flag">${team.flag}</span>
            <span class="mini-team-name">${team.name}</span>
          </div>
        </td>
        <td class="stat">${rowStats.gd > 0 ? "+" + rowStats.gd : rowStats.gd}</td>
        <td class="stat pts">${rowStats.pts}</td>
      `;
      tbody.appendChild(tr);
    });
  });

  DOM.sidebarWildcardTbody.innerHTML = "";
  const thirds = calculateThirdPlacedList();

  thirds.forEach((row, idx) => {
    const team = TEAMS_DB[row.teamId];
    const isAdvancing = state.thirdPlaceQualifiers.includes(row.teamId);

    const tr = document.createElement("tr");
    if (isAdvancing) tr.className = "advancing-yes";

    tr.innerHTML = `
      <td><strong>${idx + 1}</strong></td>
      <td>Group ${row.group}</td>
      <td>
        <div class="mini-team-row">
          <span class="mini-team-flag">${team.flag}</span>
          <span class="mini-team-name">${team.name}</span>
        </div>
      </td>
      <td class="stat">${row.gd > 0 ? "+" + row.gd : row.gd}</td>
      <td class="stat pts">${row.pts}</td>
      <td>
        <span class="sidebar-wildcard-badge"></span>
      </td>
    `;
    DOM.sidebarWildcardTbody.appendChild(tr);
  });

  renderPathDifficultyChart();
}

function calculateGroupDangerMeter(gLetter) {
  const teamIds = GROUPS_DATA[gLetter];
  const ranks = teamIds.map(tId => TEAMS_DB[tId].rank);

  const mean = ranks.reduce((sum, val) => sum + val, 0) / ranks.length;
  const variance = ranks.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / ranks.length;
  const stdDev = Math.sqrt(variance);

  let score = Math.round(100 - (stdDev * 1.5));
  score = Math.max(10, Math.min(99, score));

  let label = "Predictable Group";
  let badgeClass = "danger-low";
  let icon = "fa-circle-check";

  if (score >= 82) {
    label = "Group of Death";
    badgeClass = "danger-high";
    icon = "fa-skull";
  } else if (score >= 65) {
    label = "Competitive Group";
    badgeClass = "danger-mid";
    icon = "fa-fire";
  }

  return { score, label, badgeClass, icon };
}

// --- 4. SEQUENTIAL ROUND MATCH CARD FEEDS ---
function renderWizardMatchFeed() {
  DOM.matchScorecardList.innerHTML = "";
  const step = state.wizardStep;

  // A. Group Stage matchdays
  if (step.startsWith("md")) {
    const list = GROUP_STAGE_MATCHES[step];
    
    list.forEach(m => {
      const key = `${m.group}_${m.matchIndex}`;
      const score = state.groupMatchScores[key] || { scoreA: "", scoreB: "" };
      const teamA = TEAMS_DB[m.teamA];
      const teamB = TEAMS_DB[m.teamB];

      const card = document.createElement("div");
      card.className = `predict-match-card ${score.scoreA !== "" && score.scoreB !== "" ? "completed" : ""}`;
      card.dataset.matchKey = key;
      card.dataset.teamA = m.teamA;
      card.dataset.teamB = m.teamB;

      card.innerHTML = `
        <div class="card-main-row">
          <div class="card-team-side left">
            <span class="card-flag">${teamA.flag}</span>
            <span class="card-name">${teamA.name}</span>
          </div>
          <div class="card-score-mid">
            <span class="card-meta-text">Group ${m.group}</span>
            <div class="card-score-row">
              <input type="number" min="0" max="99" class="card-score-box input-score-a" value="${score.scoreA}" data-key="${key}" data-team="A" ${state.isViewer ? "disabled" : ""}>
              <span class="card-dash">-</span>
              <input type="number" min="0" max="99" class="card-score-box input-score-b" value="${score.scoreB}" data-key="${key}" data-team="B" ${state.isViewer ? "disabled" : ""}>
            </div>
          </div>
          <div class="card-team-side right">
            <span class="card-name">${teamB.name}</span>
            <span class="card-flag">${teamB.flag}</span>
          </div>
        </div>
        <div class="card-goalscorers-panel hidden" id="scorers-${key}"></div>
        <div class="card-ai-commentary-panel">
          <button class="btn-ai-preview-toggle glass-btn" data-key="${key}" data-team-a="${m.teamA}" data-team-b="${m.teamB}"><i class="fa-solid fa-wand-magic-sparkles"></i> AI Preview</button>
          <div class="ai-preview-content hidden" id="ai-content-${key}"></div>
        </div>
      `;
      DOM.matchScorecardList.appendChild(card);
      renderMatchGoalscorers(key, m.teamA, m.teamB, score.scoreA, score.scoreB, card.querySelector(`#scorers-${key}`));
    });

    // Score entry listeners
    document.querySelectorAll(".card-score-box").forEach(input => {
      input.addEventListener("input", handleGroupScoreInput);
    });

  } else {
    // B. Knockout rounds clashes - ordered by bracket tree symmetry
    let matchesInRound = [];
    if (step === "r32") {
      matchesInRound = [73, 75, 74, 77, 76, 78, 79, 80, 81, 82, 83, 84, 85, 87, 86, 88];
    } else if (step === "r16") {
      matchesInRound = [90, 89, 91, 92, 94, 93, 96, 95];
    } else if (step === "qf") {
      matchesInRound = [97, 98, 99, 100];
    } else if (step === "sf") {
      matchesInRound = [101, 102];
    } else {
      matchesInRound = [103, 104];
    }

    matchesInRound.forEach(mId => {
      const match = KNOCKOUT_MATCHES[mId];
      const resolved = match.resolve();
      
      const teamA = resolved.a ? TEAMS_DB[resolved.a] : null;
      const teamB = resolved.b ? TEAMS_DB[resolved.b] : null;
      
      const score = state.knockoutScores[mId] || { scoreA: "", scoreB: "", pWinner: "" };
      const isComplete = (score.scoreA !== "" && score.scoreB !== "" && 
                           (parseInt(score.scoreA) !== parseInt(score.scoreB) || score.pWinner !== ""));
      
      const card = document.createElement("div");
      card.className = `predict-match-card ${isComplete ? "completed" : ""}`;
      card.id = `wizard-card-m${mId}`;
      card.dataset.matchId = mId;
      card.dataset.teamA = resolved.a || "";
      card.dataset.teamB = resolved.b || "";

      card.innerHTML = `
        <div class="card-main-row">
          <div class="card-team-side left">
            <span class="card-flag">${teamA ? teamA.flag : "🏳️"}</span>
            <span class="card-name">${teamA ? teamA.name : getKnockoutPlaceholder(mId, "a")}</span>
          </div>
          <div class="card-score-mid">
            <span class="card-meta-text">Match ${mId}</span>
            <div class="card-score-row">
              <input type="number" min="0" max="99" class="card-score-box input-k-score-a" value="${score.scoreA}" data-match-id="${mId}" data-team="A" ${!teamA || !teamB || state.isViewer ? "disabled" : ""}>
              <span class="card-dash">-</span>
              <input type="number" min="0" max="99" class="card-score-box input-k-score-b" value="${score.scoreB}" data-match-id="${mId}" data-team="B" ${!teamA || !teamB || state.isViewer ? "disabled" : ""}>
            </div>
          </div>
          <div class="card-team-side right">
            <span class="card-name">${teamB ? teamB.name : getKnockoutPlaceholder(mId, "b")}</span>
            <span class="card-flag">${teamB ? teamB.flag : "🏳️"}</span>
          </div>
        </div>
        
        <!-- Interactive shootout chooser row if draw -->
        <div class="shootout-section-container hidden" id="shootout-section-m${mId}">
          <h5><i class="fa-solid fa-futbol"></i> DECIDE PENALTY SHOOTOUT WINNER</h5>
          <div class="shootout-btn-row">
            <button class="shootout-btn ${score.pWinner === resolved.a ? "selected" : ""}" data-match-id="${mId}" data-pwinner-id="${resolved.a || ""}" ${state.isViewer ? "disabled" : ""}>
              <span>${teamA ? teamA.flag : ""}</span> <span>${teamA ? teamA.name : "Team A"}</span>
            </button>
            <button class="shootout-btn ${score.pWinner === resolved.b ? "selected" : ""}" data-match-id="${mId}" data-pwinner-id="${resolved.b || ""}" ${state.isViewer ? "disabled" : ""}>
              <span>${teamB ? teamB.flag : ""}</span> <span>${teamB ? teamB.name : "Team B"}</span>
            </button>
          </div>
        </div>

        <div class="card-goalscorers-panel hidden" id="scorers-k_${mId}"></div>
        <div class="card-ai-commentary-panel">
          <button class="btn-ai-preview-toggle glass-btn" data-key="k_${mId}" data-team-a="${resolved.a || ''}" data-team-b="${resolved.b || ''}"><i class="fa-solid fa-wand-magic-sparkles"></i> AI Preview</button>
          <div class="ai-preview-content hidden" id="ai-content-k_${mId}"></div>
        </div>
      `;
      DOM.matchScorecardList.appendChild(card);
      renderMatchGoalscorers("k_" + mId, resolved.a, resolved.b, score.scoreA, score.scoreB, card.querySelector(`#scorers-k_${mId}`));

      // Show shootout immediately if score is tied and fields are filled
      if (score.scoreA !== "" && score.scoreB !== "" && parseInt(score.scoreA) === parseInt(score.scoreB)) {
        card.querySelector(".shootout-section-container").classList.remove("hidden");
      }
    });

    // Event hooks
    document.querySelectorAll(".input-k-score-a, .input-k-score-b").forEach(input => {
      input.addEventListener("input", handleKnockoutScoreInput);
    });

    document.querySelectorAll(".shootout-btn").forEach(btn => {
      btn.addEventListener("click", handlePenaltyShootoutPick);
    });
  }

  // AI Preview toggle listeners
  document.querySelectorAll(".btn-ai-preview-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.key;
      const teamA = btn.dataset.teamA;
      const teamB = btn.dataset.teamB;
      const contentEl = document.getElementById(`ai-content-${key}`);
      if (contentEl.classList.contains("hidden")) {
        fetchAICommentary(key, teamA, teamB, contentEl);
      } else {
        contentEl.classList.add("hidden");
      }
    });
  });

  // C. Update next stage unlocks
  verifyActiveStageCompleted();
}

function handleGroupScoreInput(e) {
  if (state.isViewer) return;
  const key = e.target.dataset.key;
  const team = e.target.dataset.team;
  const val = e.target.value;

  if (!state.groupMatchScores[key]) {
    state.groupMatchScores[key] = { scoreA: "", scoreB: "" };
  }

  if (team === "A") {
    state.groupMatchScores[key].scoreA = val;
  } else {
    state.groupMatchScores[key].scoreB = val;
  }

  // Border highlight update on completion
  const card = e.target.closest(".predict-match-card");
  const s = state.groupMatchScores[key];
  if (s.scoreA !== "" && s.scoreB !== "") {
    card.classList.add("completed");
  } else {
    card.classList.remove("completed");
  }

  // Recalculate goalscorers
  renderMatchGoalscorers(key, card.dataset.teamA, card.dataset.teamB, s.scoreA, s.scoreB, card.querySelector(`#scorers-${key}`));

  // Recalculate
  recalculateAllGroupStandings();
  renderSidebarStandings();
  clearKnockoutTreeDependentSlots();
  
  verifyActiveStageCompleted();
  saveToLocalStorage();
}

function handleKnockoutScoreInput(e) {
  if (state.isViewer) return;
  const mId = parseInt(e.target.dataset.matchId);
  const team = e.target.dataset.team;
  const val = e.target.value;

  if (!state.knockoutScores[mId]) {
    state.knockoutScores[mId] = { scoreA: "", scoreB: "", pWinner: "" };
  }

  const score = state.knockoutScores[mId];
  if (team === "A") {
    score.scoreA = val;
  } else {
    score.scoreB = val;
  }

  const card = document.getElementById(`wizard-card-m${mId}`);
  const shootoutSection = card.querySelector(".shootout-section-container");

  // Tied match trigger shootout chooser
  if (score.scoreA !== "" && score.scoreB !== "" && parseInt(score.scoreA) === parseInt(score.scoreB)) {
    shootoutSection.classList.remove("hidden");
    // Clear previous normal winner picks to force shootout selection
    delete state.knockoutPicks[mId];
  } else {
    shootoutSection.classList.add("hidden");
    score.pWinner = "";
    
    // Normal winner mapping
    if (score.scoreA !== "" && score.scoreB !== "") {
      const resolved = KNOCKOUT_MATCHES[mId].resolve();
      state.knockoutPicks[mId] = parseInt(score.scoreA) > parseInt(score.scoreB) ? resolved.a : resolved.b;
      card.classList.add("completed");
    } else {
      delete state.knockoutPicks[mId];
      card.classList.remove("completed");
    }
  }

  // Recalculate goalscorers
  renderMatchGoalscorers("k_" + mId, card.dataset.teamA, card.dataset.teamB, score.scoreA, score.scoreB, card.querySelector(`#scorers-k_${mId}`));

  // Clear downstream dependencies
  clearKnockoutTreeDependentSlots();
  verifyActiveStageCompleted();
  saveToLocalStorage();
}

function handlePenaltyShootoutPick(e) {
  if (state.isViewer) return;
  const btn = e.target.closest(".shootout-btn");
  const mId = parseInt(btn.dataset.matchId);
  const pWinner = btn.dataset.pwinnerId;

  if (!state.knockoutScores[mId]) return;
  
  state.knockoutScores[mId].pWinner = pWinner;
  state.knockoutPicks[mId] = pWinner;

  // Toggle selection classes in shootout row
  const row = btn.closest(".shootout-btn-row");
  row.querySelectorAll(".shootout-btn").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");

  // Highlight scorecard as complete
  const card = document.getElementById(`wizard-card-m${mId}`);
  card.classList.add("completed");

  // Cascade
  clearKnockoutTreeDependentSlots();
  verifyActiveStageCompleted();
  saveToLocalStorage();
}


// --- 5. PROGRESS VALIDATION & NAVIGATION ---
function verifyActiveStageCompleted() {
  const step = state.wizardStep;
  let isComplete = false;

  if (step.startsWith("md")) {
    // Check all 24 games of the active matchday
    let count = 0;
    GROUP_STAGE_MATCHES[step].forEach(m => {
      const key = `${m.group}_${m.matchIndex}`;
      const score = state.groupMatchScores[key];
      if (score && score.scoreA !== "" && score.scoreB !== "" && 
          score.scoreA !== undefined && score.scoreB !== undefined) {
        count++;
      }
    });
    isComplete = (count === 24);
  } else {
    // Check knockout games of active step
    const roundMapping = {
      r32: { start: 73, end: 88 },
      r16: { start: 89, end: 96 },
      qf: { start: 97, end: 100 },
      sf: { start: 101, end: 102 },
      final: { start: 103, end: 104 }
    };
    
    const range = roundMapping[step];
    let count = 0;
    
    for (let mId = range.start; mId <= range.end; mId++) {
      if (state.knockoutPicks[mId]) count++;
    }
    
    isComplete = (count === (range.end - range.start + 1));
  }

  // Update "Next Stage" button visual status
  if (isComplete) {
    DOM.btnNextStage.classList.remove("disabled");
  } else {
    DOM.btnNextStage.classList.add("disabled");
  }
}

// Stage transition button click
DOM.btnNextStage.addEventListener("click", () => {
  if (DOM.btnNextStage.classList.contains("disabled")) {
    showToast("Please enter predictions for all matches in this stage first!", true);
    return;
  }

  const nextStepMap = {
    md1: "md2",
    md2: "md3",
    md3: "r32",
    r32: "r16",
    r16: "qf",
    qf: "sf",
    sf: "final",
    final: "championship"
  };

  const nextStep = nextStepMap[state.wizardStep];
  if (nextStep) {
    switchWizardStep(nextStep);
    showToast("Simulation advanced to next round!");
    // Scroll active list back to top
    DOM.matchScorecardList.scrollTop = 0;
  }
});

// Clear current stage predictions
DOM.btnClearStage.addEventListener("click", () => {
  if (state.isViewer) return;
  const step = state.wizardStep;
  
  if (confirm(`Are you sure you want to clear all predictions for this stage (${step.toUpperCase()})?`)) {
    if (step.startsWith("md")) {
      // Clear group matches for this matchday
      GROUP_STAGE_MATCHES[step].forEach(m => {
        const key = `${m.group}_${m.matchIndex}`;
        delete state.groupMatchScores[key];
      });
      recalculateAllGroupStandings();
      renderSidebarStandings();
    } else {
      // Clear knockout scores and picks for this round
      const roundMapping = {
        r32: { start: 73, end: 88 },
        r16: { start: 89, end: 96 },
        qf: { start: 97, end: 100 },
        sf: { start: 101, end: 102 },
        final: { start: 103, end: 104 }
      };
      
      const range = roundMapping[step];
      for (let mId = range.start; mId <= range.end; mId++) {
        delete state.knockoutScores[mId];
        delete state.knockoutPicks[mId];
      }
    }

    clearKnockoutTreeDependentSlots();
    renderWizardMatchFeed();
    showToast("Predictions cleared for this stage!");
    saveToLocalStorage();
  }
});

// --- 6. AUTO-SIMULATE "SIMULATE ROUND" UTILITY ---
DOM.btnQuickFillStage.addEventListener("click", () => {
  if (state.isViewer) return;
  const step = state.wizardStep;

  if (step.startsWith("md")) {
    // A. Simulate group matches in this stage based on FIFA ranking metrics
    GROUP_STAGE_MATCHES[step].forEach(m => {
      const key = `${m.group}_${m.matchIndex}`;
      const rankA = TEAMS_DB[m.teamA].rank;
      const rankB = TEAMS_DB[m.teamB].rank;

      let scoreA = 1;
      let scoreB = 1;

      if (rankA < rankB - 35) {
        scoreA = 3; scoreB = 0;
      } else if (rankA < rankB - 10) {
        scoreA = 2; scoreB = 1;
      } else if (rankB < rankA - 35) {
        scoreA = 0; scoreB = 3;
      } else if (rankB < rankA - 10) {
        scoreA = 1; scoreB = 2;
      }

      state.groupMatchScores[key] = { scoreA, scoreB };
    });

    recalculateAllGroupStandings();
    renderSidebarStandings();

  } else {
    // B. Simulate active knockout round matches based on FIFA rankings
    const roundMapping = {
      r32: { start: 73, end: 88 },
      r16: { start: 89, end: 96 },
      qf: { start: 97, end: 100 },
      sf: { start: 101, end: 102 },
      final: { start: 103, end: 104 }
    };
    
    const range = roundMapping[step];
    
    for (let mId = range.start; mId <= range.end; mId++) {
      const match = KNOCKOUT_MATCHES[mId];
      const resolved = match.resolve();
      
      if (resolved.a && resolved.b) {
        const rankA = TEAMS_DB[resolved.a].rank;
        const rankB = TEAMS_DB[resolved.b].rank;
        
        let scoreA = 2;
        let scoreB = 1;
        
        if (rankA > rankB) {
          scoreA = 1; scoreB = 2;
        }

        // Handle third place match as part of final stage simulation
        state.knockoutScores[mId] = { scoreA, scoreB, pWinner: "" };
        state.knockoutPicks[mId] = rankA < rankB ? resolved.a : resolved.b;
      }
    }
  }

  clearKnockoutTreeDependentSlots();
  renderWizardMatchFeed();
  showToast("Remaining stage matches successfully auto-simulated!");
  saveToLocalStorage();
});


// --- 7. CHAMPIONSHIP FINISH SCREEN RENDERING ---
function renderChampionshipScreen() {
  const finalMatches = KNOCKOUT_MATCHES[104].resolve();
  const championId = state.knockoutPicks[104];
  const runnerId = championId === finalMatches.a ? finalMatches.b : finalMatches.a;
  const thirdId = state.knockoutPicks[103];

  const champ = TEAMS_DB[championId];
  const runner = runnerId ? TEAMS_DB[runnerId] : null;
  const third = thirdId ? TEAMS_DB[thirdId] : null;

  DOM.finishFlag.innerText = champ.flag;
  DOM.finishName.innerText = champ.name.toUpperCase();
  DOM.finishSilverName.innerText = runner ? runner.name : "Germany";
  DOM.finishBronzeName.innerText = third ? third.name : "Argentina";

  // Recalculate tournament stats for the dashboard
  let totalGoals = 0;
  let matchesCount = 0;
  let biggestUpset = null; // { winner, loser, diff, scoreText, label }

  // A. Process Group Matches
  const mdList = ["md1", "md2", "md3"];
  mdList.forEach(md => {
    GROUP_STAGE_MATCHES[md].forEach(m => {
      const key = `${m.group}_${m.matchIndex}`;
      const score = state.groupMatchScores[key];
      if (score && score.scoreA !== "" && score.scoreB !== "") {
        const sA = parseInt(score.scoreA) || 0;
        const sB = parseInt(score.scoreB) || 0;
        totalGoals += (sA + sB);
        matchesCount++;

        // Upset check: Winner's FIFA rank number must be larger than loser's (meaning winner is lower-ranked)
        if (sA !== sB) {
          const winnerId = sA > sB ? m.teamA : m.teamB;
          const loserId = sA > sB ? m.teamB : m.teamA;
          const rankWinner = TEAMS_DB[winnerId].rank;
          const rankLoser = TEAMS_DB[loserId].rank;
          if (rankWinner > rankLoser) {
            const diff = rankWinner - rankLoser;
            if (!biggestUpset || diff > biggestUpset.diff) {
              biggestUpset = {
                winner: TEAMS_DB[winnerId],
                loser: TEAMS_DB[loserId],
                diff: diff,
                scoreText: `${sA}-${sB}`,
                label: `Group ${m.group}`
              };
            }
          }
        }
      }
    });
  });

  // B. Process Knockout Matches
  for (let mId = 73; mId <= 104; mId++) {
    const score = state.knockoutScores[mId];
    if (score && score.scoreA !== "" && score.scoreB !== "") {
      const sA = parseInt(score.scoreA) || 0;
      const sB = parseInt(score.scoreB) || 0;
      totalGoals += (sA + sB);
      matchesCount++;

      // Upset check
      const resolved = KNOCKOUT_MATCHES[mId].resolve();
      const winnerId = state.knockoutPicks[mId];
      if (winnerId && resolved.a && resolved.b) {
        const loserId = winnerId === resolved.a ? resolved.b : resolved.a;
        const rankWinner = TEAMS_DB[winnerId].rank;
        const rankLoser = TEAMS_DB[loserId].rank;
        if (rankWinner > rankLoser) {
          const diff = rankWinner - rankLoser;
          if (!biggestUpset || diff > biggestUpset.diff) {
            biggestUpset = {
              winner: TEAMS_DB[winnerId],
              loser: TEAMS_DB[loserId],
              diff: diff,
              scoreText: `${sA}-${sB}` + (score.pWinner ? " (pens)" : ""),
              label: mId === 104 ? "World Cup Final" : mId === 103 ? "3rd Place Play-Off" : `Knockout Match ${mId}`
            };
          }
        }
      }
    }
  }

  // Populate goals stats
  if (DOM.statTotalGoals) DOM.statTotalGoals.innerText = totalGoals;
  if (DOM.statAvgGoals) {
    const avg = matchesCount > 0 ? (totalGoals / matchesCount).toFixed(1) : "0.0";
    DOM.statAvgGoals.innerText = avg;
  }

  // Populate biggest upset card
  if (DOM.upsetMatchRow) {
    if (biggestUpset) {
      DOM.upsetMatchRow.innerHTML = `
        <div class="upset-badge-label">${biggestUpset.label}</div>
        <div class="upset-teams-display">
          <span class="upset-winner"><span class="upset-flag">${biggestUpset.winner.flag}</span> <strong>${biggestUpset.winner.name}</strong> (Rank #${biggestUpset.winner.rank})</span>
          <span class="upset-vs">beat</span>
          <span class="upset-loser"><strong>${biggestUpset.loser.name}</strong> (Rank #${biggestUpset.loser.rank}) <span class="upset-flag">${biggestUpset.loser.flag}</span></span>
        </div>
        <div class="upset-scoreline-banner">${biggestUpset.scoreText}</div>
      `;
    } else {
      DOM.upsetMatchRow.innerHTML = `<div class="sidebar-help-text" style="text-align: center; width: 100%;">No upsets recorded in this tournament!</div>`;
    }
  }

  // C. Golden Boot Aggregator
  if (DOM.goldenBootTbody) {
    DOM.goldenBootTbody.innerHTML = "";
    const scorerMap = {}; // playerName -> { goals: num, teamId: teamId }

    // Map players from goalscorers database
    Object.keys(state.goalscorers).forEach(matchKey => {
      const matchScorers = state.goalscorers[matchKey];
      if (matchScorers) {
        let teamAId = null;
        let teamBId = null;

        if (matchKey.startsWith("k_")) {
          const mId = parseInt(matchKey.replace("k_", ""));
          const resolved = KNOCKOUT_MATCHES[mId].resolve();
          teamAId = resolved.a;
          teamBId = resolved.b;
        } else {
          // Group stage
          const parts = matchKey.split("_");
          const group = parts[0];
          const idx = parseInt(parts[1]);
          const m = GROUP_STAGE_MATCHES[`md${idx < 2 ? 1 : idx < 4 ? 2 : 3}`].find(match => match.group === group && match.matchIndex === idx);
          if (m) {
            teamAId = m.teamA;
            teamBId = m.teamB;
          }
        }

        if (matchScorers.teamA && teamAId) {
          matchScorers.teamA.forEach(p => {
            if (p) {
              if (!scorerMap[p]) scorerMap[p] = { goals: 0, teamId: teamAId };
              scorerMap[p].goals++;
            }
          });
        }
        if (matchScorers.teamB && teamBId) {
          matchScorers.teamB.forEach(p => {
            if (p) {
              if (!scorerMap[p]) scorerMap[p] = { goals: 0, teamId: teamBId };
              scorerMap[p].goals++;
            }
          });
        }
      }
    });

    const scorers = [];
    Object.keys(scorerMap).forEach(pName => {
      scorers.push({ name: pName, ...scorerMap[pName] });
    });

    scorers.sort((a, b) => b.goals - a.goals);

    const topScorers = scorers.slice(0, 5);
    if (topScorers.length === 0) {
      DOM.goldenBootTbody.innerHTML = `<tr><td colspan="4" style="text-align: center;" class="sidebar-help-text">No scorers recorded in this simulation!</td></tr>`;
    } else {
      topScorers.forEach((s, idx) => {
        const team = TEAMS_DB[s.teamId];
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${idx + 1}</strong></td>
          <td><i class="fa-solid fa-futbol" style="color: var(--gold-400); margin-right: 6px;"></i> ${s.name}</td>
          <td>${team ? team.flag + " " + team.name : "Unknown"}</td>
          <td class="stat pts" style="font-size: 0.9rem;">${s.goals}</td>
        `;
        DOM.goldenBootTbody.appendChild(tr);
      });
    }
  }

  // Prompt to save online (once per browser session)
  if (
    !state.isViewer &&
    typeof SupabaseBracket !== "undefined" &&
    SupabaseBracket.isConfigured() &&
    !sessionStorage.getItem("wc_save_share_prompt_shown")
  ) {
    sessionStorage.setItem("wc_save_share_prompt_shown", "1");
    setTimeout(() => openSaveShareModal(), 700);
  }

  // Trigger grand confetti show!
  triggerCelebratoryConfetti();
}

DOM.btnStartOver.addEventListener("click", () => {
  if (state.isViewer) return;
  if (confirm("Reset simulation and start predicting a new bracket path?")) {
    initDefaultState();
    switchWizardStep("welcome");
    showToast("Simulator reset!");
  }
});


// --- 8. WELCOME DASHBOARD PROGRESS INDICATORS ---
function updateWelcomeScreenStats() {
  // 1. Group Stage predicted count
  let groupCount = 0;
  const mdList = ["md1", "md2", "md3"];
  mdList.forEach(md => {
    GROUP_STAGE_MATCHES[md].forEach(m => {
      const key = `${m.group}_${m.matchIndex}`;
      const score = state.groupMatchScores[key];
      if (score && score.scoreA !== "" && score.scoreB !== "" && 
          score.scoreA !== undefined && score.scoreB !== undefined) {
        groupCount++;
      }
    });
  });

  DOM.txtProgGroup.innerText = `${groupCount} of 72 Games Predicted`;
  DOM.barProgGroup.style.width = `${(groupCount / 72) * 100}%`;

  // 2. Knockout predictions predicted count
  const countMatches = Object.keys(state.knockoutPicks).length;
  DOM.txtProgKnockout.innerText = `${countMatches} of 32 Matches Predicted`;
  DOM.barProgKnockout.style.width = `${(countMatches / 32) * 100}%`;

  // 3. Highlight Champion spotlight
  const championId = state.knockoutPicks[104];
  if (championId) {
    const champ = TEAMS_DB[championId];
    DOM.champFlag.innerText = champ.flag;
    DOM.champName.innerText = champ.name.toUpperCase();
    DOM.champSpotlight.classList.add("hidden");
    DOM.champSpotlightFilled.classList.remove("hidden");
  } else {
    DOM.champSpotlight.classList.remove("hidden");
    DOM.champSpotlightFilled.classList.add("hidden");
  }
}


// --- 9. FULL INTERACTIVE BRACKET DIAGRAM MODAL ---

// Resolve placeholder labels in tree
function getKnockoutPlaceholder(matchId, slot) {
  if (matchId <= 88) {
    const placeholders = {
      73: { a: "Runner-up A", b: "Runner-up B" },
      74: { a: "Winner C", b: "Runner-up F" },
      75: { a: "Winner E", b: "Wildcard #1" },
      76: { a: "Winner F", b: "Runner-up C" },
      77: { a: "Winner I", b: "Wildcard #2" },
      78: { a: "Winner A", b: "Wildcard #3" },
      79: { a: "Winner L", b: "Wildcard #4" },
      80: { a: "Winner G", b: "Wildcard #5" },
      81: { a: "Winner D", b: "Wildcard #6" },
      82: { a: "Winner H", b: "Runner-up J" },
      83: { a: "Runner-up E", b: "Runner-up I" },
      84: { a: "Winner K", b: "Wildcard #8" },
      85: { a: "Winner B", b: "Wildcard #7" },
      86: { a: "Runner-up D", b: "Runner-up G" },
      87: { a: "Winner J", b: "Runner-up H" },
      88: { a: "Runner-up K", b: "Runner-up L" }
    };
    return placeholders[matchId][slot];
  }

  if (matchId <= 96) {
    const parents = {
      89: { a: "Winner M74", b: "Winner M77" },
      90: { a: "Winner M73", b: "Winner M75" },
      91: { a: "Winner M76", b: "Winner M78" },
      92: { a: "Winner M79", b: "Winner M80" },
      93: { a: "Winner M83", b: "Winner M84" },
      94: { a: "Winner M81", b: "Winner M82" },
      95: { a: "Winner M86", b: "Winner M88" },
      96: { a: "Winner M85", b: "Winner M87" }
    };
    return parents[matchId][slot];
  }

  if (matchId <= 100) {
    const parents = {
      97: { a: "Winner M89", b: "Winner M90" },
      98: { a: "Winner M93", b: "Winner M94" },
      99: { a: "Winner M91", b: "Winner M92" },
      100: { a: "Winner M95", b: "Winner M96" }
    };
    return parents[matchId][slot];
  }

  if (matchId <= 102) {
    const parents = {
      101: { a: "Winner M97", b: "Winner M98" },
      102: { a: "Winner M99", b: "Winner M100" }
    };
    return parents[matchId][slot];
  }

  return slot === "a" ? "Winner SF 1" : "Winner SF 2";
}

// Render complete modal bracket tree
function renderCompleteModalBracket() {
  document.getElementById("list-r32-left").innerHTML = "";
  document.getElementById("list-r32-right").innerHTML = "";
  document.getElementById("list-r16-left").innerHTML = "";
  document.getElementById("list-r16-right").innerHTML = "";
  document.getElementById("list-qf-left").innerHTML = "";
  document.getElementById("list-qf-right").innerHTML = "";
  document.getElementById("list-sf-left").innerHTML = "";
  document.getElementById("list-sf-right").innerHTML = "";

  // Dynamic tree matchcard builder
  function buildModalMatchNode(matchId) {
    const match = KNOCKOUT_MATCHES[matchId];
    const resolved = match.resolve();
    
    const teamA = resolved.a ? TEAMS_DB[resolved.a] : null;
    const teamB = resolved.b ? TEAMS_DB[resolved.b] : null;
    const winnerId = state.knockoutPicks[matchId];

    const card = document.createElement("div");
    card.className = "match-card";
    card.id = `modal-node-m${matchId}`;

    card.innerHTML = `
      <div class="match-meta-tag">
        <span>Match ${matchId}</span>
        <span>${match.label}</span>
      </div>
      <div class="team-slot ${winnerId && winnerId === resolved.a ? "winner" : ""}">
        <span class="slot-flag">${teamA ? teamA.flag : "🏳️"}</span>
        <span class="slot-name">${teamA ? teamA.name : getKnockoutPlaceholder(matchId, "a")}</span>
      </div>
      <div class="team-slot ${winnerId && winnerId === resolved.b ? "winner" : ""}">
        <span class="slot-flag">${teamB ? teamB.flag : "🏳️"}</span>
        <span class="slot-name">${teamB ? teamB.name : getKnockoutPlaceholder(matchId, "b")}</span>
      </div>
    `;

    return card;
  }

  // Populate left side columns
  const r32LeftOrder = [73, 75, 74, 77, 76, 78, 79, 80];
  const r16LeftOrder = [90, 89, 91, 92];
  const qfLeftOrder = [97, 99];
  r32LeftOrder.forEach(m => document.getElementById("list-r32-left").appendChild(buildModalMatchNode(m)));
  r16LeftOrder.forEach(m => document.getElementById("list-r16-left").appendChild(buildModalMatchNode(m)));
  qfLeftOrder.forEach(m => document.getElementById("list-qf-left").appendChild(buildModalMatchNode(m)));
  document.getElementById("list-sf-left").appendChild(buildModalMatchNode(101));

  // Populate right side columns
  const r32RightOrder = [81, 82, 83, 84, 85, 87, 86, 88];
  const r16RightOrder = [94, 93, 96, 95];
  const qfRightOrder = [98, 100];
  r32RightOrder.forEach(m => document.getElementById("list-r32-right").appendChild(buildModalMatchNode(m)));
  r16RightOrder.forEach(m => document.getElementById("list-r16-right").appendChild(buildModalMatchNode(m)));
  qfRightOrder.forEach(m => document.getElementById("list-qf-right").appendChild(buildModalMatchNode(m)));
  document.getElementById("list-sf-right").appendChild(buildModalMatchNode(102));

  // Render Final and 3rd Nodes
  const finalMatches = KNOCKOUT_MATCHES[104].resolve();
  const finalTeamA = finalMatches.a ? TEAMS_DB[finalMatches.a] : null;
  const finalTeamB = finalMatches.b ? TEAMS_DB[finalMatches.b] : null;
  const finalWinnerId = state.knockoutPicks[104];

  const finalNode = document.getElementById("node-m104");
  finalNode.innerHTML = `
    <div class="team-slot ${finalWinnerId && finalWinnerId === finalMatches.a ? "winner" : ""}">
      <span class="slot-flag">${finalTeamA ? finalTeamA.flag : "🏳️"}</span>
      <span class="slot-name">${finalTeamA ? finalTeamA.name : "Winner SF 1"}</span>
    </div>
    <div class="divider-vs">VS</div>
    <div class="team-slot ${finalWinnerId && finalWinnerId === finalMatches.b ? "winner" : ""}">
      <span class="slot-flag">${finalTeamB ? finalTeamB.flag : "🏳️"}</span>
      <span class="slot-name">${finalTeamB ? finalTeamB.name : "Winner SF 2"}</span>
    </div>
  `;

  const thirdMatches = KNOCKOUT_MATCHES[103].resolve();
  const thirdTeamA = thirdMatches.a ? TEAMS_DB[thirdMatches.a] : null;
  const thirdTeamB = thirdMatches.b ? TEAMS_DB[thirdMatches.b] : null;
  const thirdWinnerId = state.knockoutPicks[103];

  const thirdNode = document.getElementById("node-m103");
  thirdNode.innerHTML = `
    <div class="team-slot ${thirdWinnerId && thirdWinnerId === thirdMatches.a ? "winner" : ""}">
      <span class="slot-flag">${thirdTeamA ? thirdTeamA.flag : "🏳️"}</span>
      <span class="slot-name">${thirdTeamA ? thirdTeamA.name : "Loser SF 1"}</span>
    </div>
    <div class="team-slot ${thirdWinnerId && thirdWinnerId === thirdMatches.b ? "winner" : ""}">
      <span class="slot-flag">${thirdTeamB ? thirdTeamB.flag : "🏳️"}</span>
      <span class="slot-name">${thirdTeamB ? thirdTeamB.name : "Loser SF 2"}</span>
    </div>
  `;

  // Render Champion Medal inside Tree
  if (finalWinnerId) {
    const champ = TEAMS_DB[finalWinnerId];
    DOM.treeChampFlag.innerText = champ.flag;
    DOM.treeChampName.innerText = champ.name.toUpperCase();
    DOM.treeChampionBadge.classList.remove("hidden");
  } else {
    DOM.treeChampionBadge.classList.add("hidden");
  }
}

// Modal Zoom operations
let modalZoom = 0.75;
function applyModalZoom() {
  DOM.bracketCanvas.style.transform = `scale(${modalZoom})`;
}

function resetModalZoom() {
  modalZoom = 0.75;
  applyModalZoom();
  DOM.bracketViewport.scrollLeft = (DOM.bracketCanvas.clientWidth * 0.75 - DOM.bracketViewport.clientWidth) / 2;
  DOM.bracketViewport.scrollTop = (DOM.bracketCanvas.clientHeight * 0.75 - DOM.bracketViewport.clientHeight) / 2;
}

DOM.btnShowFullBracket.addEventListener("click", () => {
  recalculateAllGroupStandings();
  renderCompleteModalBracket();
  DOM.bracketModal.classList.remove("hidden");
  setTimeout(resetModalZoom, 100);
});

DOM.btnCloseBracket.addEventListener("click", () => {
  if (state.isViewer) return;
  DOM.bracketModal.classList.add("hidden");
});

DOM.btnModalZoomIn.addEventListener("click", () => {
  if (modalZoom < 1.4) {
    modalZoom += 0.1;
    applyModalZoom();
  }
});

DOM.btnModalZoomOut.addEventListener("click", () => {
  if (modalZoom > 0.4) {
    modalZoom -= 0.1;
    applyModalZoom();
  }
});

DOM.btnModalZoomReset.addEventListener("click", resetModalZoom);


// --- 10. BRACKET SAVING & SERIALIZING SHARE UTILS ---
function exportStateToString() {
  return BracketShare.encodePayload(BracketShare.payloadFromSimulatorState(state));
}

function importStateFromString(hashStr) {
  const result = BracketShare.decodeShareCode(hashStr);
  if (!result.ok) return false;
  BracketShare.applyPayloadToState(state, result.payload);
  return true;
}

function getSharedBracketTitleHtml() {
  const name = state.userName || "A fan";
  const label = name.endsWith("s") ? `${name}'` : `${name}'s`;
  return `<i class="fa-solid fa-trophy highlight-gold"></i> ${label} World Cup 2026 Bracket`;
}

function enterSharedViewerMode() {
  state.isViewer = true;
  document.body.classList.add("shared-bracket-mode");
  document.title = `${state.userName || "Shared"} World Cup 2026 Bracket`;

  if (DOM.sharedBracketTitle) {
    DOM.sharedBracketTitle.innerHTML = getSharedBracketTitleHtml();
  } else {
    const headerTitle = DOM.bracketModal?.querySelector(".modal-header h3");
    if (headerTitle) headerTitle.innerHTML = getSharedBracketTitleHtml();
  }

  recalculateAllGroupStandings();
  renderCompleteModalBracket();

  if (DOM.bracketModal) DOM.bracketModal.classList.remove("hidden");
  if (DOM.sharedBracketFooter) DOM.sharedBracketFooter.classList.remove("hidden");

  setTimeout(resetModalZoom, 150);
}

// --- Supabase: save, leaderboard, ?bracket= viewer ---
function saveShareErrorMessage(code) {
  const map = {
    wrong_pin: "Wrong PIN for this nickname. Try again or pick another nickname.",
    invalid_nickname: "Nickname must be 2–20 characters (letters, numbers, underscore).",
    invalid_pin: "PIN must be exactly 4 digits.",
    not_configured: "Online save is not configured. Set Supabase URL and anon key in supabase-utils.js.",
    not_found: "No bracket found for that nickname."
  };
  return map[code] || "Could not save bracket. Please try again.";
}

function resetSaveShareModalPanels() {
  if (!DOM.saveShareModal) return;
  DOM.saveShareFormPanel?.classList.remove("hidden");
  DOM.saveShareSuccessPanel?.classList.add("hidden");
  if (DOM.saveShareError) {
    DOM.saveShareError.classList.add("hidden");
    DOM.saveShareError.textContent = "";
  }
}

function openSaveShareModal() {
  if (state.isViewer || typeof SupabaseBracket === "undefined" || !SupabaseBracket.isConfigured()) {
    showToast(saveShareErrorMessage("not_configured"), true);
    return;
  }
  resetSaveShareModalPanels();
  if (DOM.inputSaveNickname) {
    const seed = state.userName ? SupabaseBracket.normalizeNickname(state.userName) : "";
    DOM.inputSaveNickname.value = SupabaseBracket.isValidNickname(seed) ? seed : "";
  }
  if (DOM.inputSavePin) DOM.inputSavePin.value = "";
  DOM.saveShareModal?.classList.remove("hidden");
}

function closeSaveShareModal() {
  DOM.saveShareModal?.classList.add("hidden");
}

async function submitCurrentBracketOnline() {
  if (!DOM.btnSubmitSaveShare) return;
  const nickname = DOM.inputSaveNickname?.value || "";
  const payload = BracketShare.payloadFromSimulatorState(state);

  DOM.btnSubmitSaveShare.disabled = true;
  const result = await SupabaseBracket.submitBracket(nickname, payload, TEAMS_DB);
  DOM.btnSubmitSaveShare.disabled = false;

  if (!result.ok) {
    if (DOM.saveShareError) {
      DOM.saveShareError.textContent = saveShareErrorMessage(result.error);
      DOM.saveShareError.classList.remove("hidden");
    }
    return;
  }

  if (DOM.txtSaveShareLink) DOM.txtSaveShareLink.value = result.url;
  DOM.saveShareFormPanel?.classList.add("hidden");
  DOM.saveShareSuccessPanel?.classList.remove("hidden");
  showToast("Bracket saved to the leaderboard!");
  renderLeaderboard();
}

async function renderLeaderboard() {
  if (!DOM.leaderboardList) return;

  const configured = typeof SupabaseBracket !== "undefined" && SupabaseBracket.isConfigured();
  if (DOM.leaderboardUnconfigured) {
    DOM.leaderboardUnconfigured.classList.toggle("hidden", configured);
  }
  if (!configured) {
    DOM.leaderboardList.innerHTML = "";
    return;
  }

  DOM.leaderboardList.innerHTML = `<p class="sidebar-help-text">Loading leaderboard…</p>`;
  const result = await SupabaseBracket.listBrackets();

  if (!result.ok) {
    DOM.leaderboardList.innerHTML = `<p class="save-share-error">${saveShareErrorMessage(result.error)}</p>`;
    return;
  }

  if (!result.brackets.length) {
    DOM.leaderboardList.innerHTML = `<p class="sidebar-help-text">No saved brackets yet. Complete a prediction and be the first!</p>`;
    return;
  }

  DOM.leaderboardList.innerHTML = "";
  result.brackets.forEach((row) => {
    const href = SupabaseBracket.buildSubmittedBracketUrl(row.nickname);
    const timeLabel = row.updated_at
      ? new Date(row.updated_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
      : "";
    const link = document.createElement("a");
    link.className = "leaderboard-row";
    link.href = href;
    link.innerHTML = `
      <div class="leaderboard-row-main">
        <span class="leaderboard-nick">@${row.nickname}</span>
        <span class="leaderboard-champ">${row.champion || "—"}</span>
      </div>
      <span class="leaderboard-time">${timeLabel}</span>
    `;
    DOM.leaderboardList.appendChild(link);
  });
}

async function loadSubmittedBracketFromUrl() {
  if (typeof SupabaseBracket === "undefined" || !SupabaseBracket.isConfigured()) return false;

  const nickname = SupabaseBracket.extractBracketNicknameFromPage();
  if (!nickname) return false;

  const result = await SupabaseBracket.getBracket(nickname);
  if (!result.ok) {
    if (result.error === "not_found") {
      showToast(saveShareErrorMessage("not_found"), true);
    } else {
      showToast(saveShareErrorMessage(result.error), true);
    }
    return false;
  }

  BracketShare.applyPayloadToState(state, result.payload);
  if (!state.userName) state.userName = result.nickname;
  enterSharedViewerMode();
  showToast(`Loaded @${result.nickname}'s bracket`);
  return true;
}

function bindSupabaseUi() {
  if (DOM.btnPodiumSaveShare) {
    DOM.btnPodiumSaveShare.addEventListener("click", openSaveShareModal);
  }
  if (DOM.btnCloseSaveShare) {
    DOM.btnCloseSaveShare.addEventListener("click", closeSaveShareModal);
  }
  if (DOM.btnSubmitSaveShare) {
    DOM.btnSubmitSaveShare.addEventListener("click", () => {
      void submitCurrentBracketOnline();
    });
  }
  if (DOM.btnCopySaveShareLink) {
    DOM.btnCopySaveShareLink.addEventListener("click", () => {
      DOM.txtSaveShareLink?.select();
      document.execCommand("copy");
      showToast("Link copied to clipboard!");
    });
  }
  if (DOM.btnSaveShareDone) {
    DOM.btnSaveShareDone.addEventListener("click", closeSaveShareModal);
  }
  if (DOM.btnRefreshLeaderboard) {
    DOM.btnRefreshLeaderboard.addEventListener("click", () => {
      void renderLeaderboard();
    });
  }
  if (DOM.btnShowLeaderboard) {
    DOM.btnShowLeaderboard.addEventListener("click", () => {
      switchWizardStep("welcome");
      setTimeout(() => {
        DOM.leaderboardSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    });
  }
}

// Sidebar Settings
DOM.stabBtnGroups.addEventListener("click", () => {
  DOM.stabBtnGroups.classList.add("active");
  DOM.stabBtnWildcards.classList.remove("active");
  if (DOM.stabBtnDifficulty) DOM.stabBtnDifficulty.classList.remove("active");
  DOM.stabContentGroups.classList.add("active");
  DOM.stabContentWildcards.classList.remove("active");
  if (DOM.stabContentDifficulty) DOM.stabContentDifficulty.classList.remove("active");
});

DOM.stabBtnWildcards.addEventListener("click", () => {
  DOM.stabBtnGroups.classList.remove("active");
  DOM.stabBtnWildcards.classList.add("active");
  if (DOM.stabBtnDifficulty) DOM.stabBtnDifficulty.classList.remove("active");
  DOM.stabContentGroups.classList.remove("active");
  DOM.stabContentWildcards.classList.add("active");
  if (DOM.stabContentDifficulty) DOM.stabContentDifficulty.classList.remove("active");
});

if (DOM.stabBtnDifficulty) {
  DOM.stabBtnDifficulty.addEventListener("click", () => {
    DOM.stabBtnGroups.classList.remove("active");
    DOM.stabBtnWildcards.classList.remove("active");
    DOM.stabBtnDifficulty.classList.add("active");
    DOM.stabContentGroups.classList.remove("active");
    DOM.stabContentWildcards.classList.remove("active");
    DOM.stabContentDifficulty.classList.add("active");
    renderPathDifficultyChart();
  });
}

// Share triggers
function triggerShareModal() {
  const hash = exportStateToString();
  const link = `${window.location.origin}${window.location.pathname}#share=${hash}`;
  DOM.txtShareLink.value = link;
  DOM.shareModal.classList.remove("hidden");
}

DOM.btnCopyLink.addEventListener("click", () => {
  DOM.txtShareLink.select();
  document.execCommand("copy");
  showToast("Shareable link successfully copied to clipboard!");
});

DOM.btnDownloadJson.addEventListener("click", () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "world_cup_predictions.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Bracket file saved successfully!");
});

DOM.btnFooterShare.addEventListener("click", triggerShareModal);
DOM.btnSpotlightShare.addEventListener("click", triggerShareModal);
DOM.btnPodiumShareFinal.addEventListener("click", triggerShareModal);
DOM.btnCloseShare.addEventListener("click", () => DOM.shareModal.classList.add("hidden"));

// Import file launcher
DOM.btnLoadJsonTrigger.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      try {
        const loaded = JSON.parse(readerEvent.target.result);
        if (loaded.groupMatchScores || loaded.knockoutPicks) {
          state = loaded;
          showToast("Predictions successfully loaded from file!");
          switchWizardStep(state.wizardStep);
        } else {
          showToast("Invalid JSON schema.", true);
        }
      } catch {
        showToast("Error loading file.", true);
      }
    };
    reader.readAsText(file);
  };
  input.click();
});

// Code importer trigger
DOM.btnImportCode.addEventListener("click", () => {
  const val = DOM.inputImportCode.value.trim();
  if (!val) return;
  let code = val;
  if (val.includes("#share=")) {
    code = val.split("#share=")[1];
  }
  
  const success = importStateFromString(code);
  if (success) {
    showToast("Shared predictions imported!");
    switchWizardStep(state.wizardStep);
    DOM.inputImportCode.value = "";
  } else {
    showToast("Invalid bracket code, please try again.", true);
  }
});


// --- 12. KNOCKOUT MATCHES TREE PROGRESS RESOLVER MAPPINGS ---
// Maps exact knockout slots for matches 73 to 104
const KNOCKOUT_MATCHES = {
  // Round of 32 (Matches 73 to 88)
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

  // Round of 16 (Matches 89 to 96)
  89: { label: "M89: Winner 74 vs Winner 77", resolve: () => ({ a: state.knockoutPicks[74], b: state.knockoutPicks[77] }) },
  90: { label: "M90: Winner 73 vs Winner 75", resolve: () => ({ a: state.knockoutPicks[73], b: state.knockoutPicks[75] }) },
  91: { label: "M91: Winner 76 vs Winner 78", resolve: () => ({ a: state.knockoutPicks[76], b: state.knockoutPicks[78] }) },
  92: { label: "M92: Winner 79 vs Winner 80", resolve: () => ({ a: state.knockoutPicks[79], b: state.knockoutPicks[80] }) },
  93: { label: "M93: Winner 83 vs Winner 84", resolve: () => ({ a: state.knockoutPicks[83], b: state.knockoutPicks[84] }) },
  94: { label: "M94: Winner 81 vs Winner 82", resolve: () => ({ a: state.knockoutPicks[81], b: state.knockoutPicks[82] }) },
  95: { label: "M95: Winner 86 vs Winner 88", resolve: () => ({ a: state.knockoutPicks[86], b: state.knockoutPicks[88] }) },
  96: { label: "M96: Winner 85 vs Winner 87", resolve: () => ({ a: state.knockoutPicks[85], b: state.knockoutPicks[87] }) },

  // Quarter-Finals (Matches 97 to 100)
  97: { label: "QF 1: Winner 89 vs Winner 90", resolve: () => ({ a: state.knockoutPicks[89], b: state.knockoutPicks[90] }) },
  98: { label: "QF 2: Winner 93 vs Winner 94", resolve: () => ({ a: state.knockoutPicks[93], b: state.knockoutPicks[94] }) },
  99: { label: "QF 3: Winner 91 vs Winner 92", resolve: () => ({ a: state.knockoutPicks[91], b: state.knockoutPicks[92] }) },
  100: { label: "QF 4: Winner 95 vs Winner 96", resolve: () => ({ a: state.knockoutPicks[95], b: state.knockoutPicks[96] }) },

  // Semi-Finals (Matches 101 to 102)
  101: { label: "SF 1: Winner 97 vs Winner 98", resolve: () => ({ a: state.knockoutPicks[97], b: state.knockoutPicks[98] }) },
  102: { label: "SF 2: Winner 99 vs Winner 100", resolve: () => ({ a: state.knockoutPicks[99], b: state.knockoutPicks[100] }) },

  // Third place play-off
  103: {
    label: "Match 103: Loser 101 vs Loser 102",
    resolve: () => {
      const winner101 = state.knockoutPicks[101];
      const winner102 = state.knockoutPicks[102];
      const teams101 = KNOCKOUT_MATCHES[101].resolve();
      const teams102 = KNOCKOUT_MATCHES[102].resolve();
      
      const loser101 = winner101 && teams101.a && teams101.b ? (winner101 === teams101.a ? teams101.b : teams101.a) : null;
      const loser102 = winner102 && teams102.a && teams102.b ? (winner102 === teams102.a ? teams102.b : teams102.a) : null;
      return { a: loser101, b: loser102 };
    }
  },

  // Grand Final
  104: { label: "Match 104: Winner 101 vs Winner 102", resolve: () => ({ a: state.knockoutPicks[101], b: state.knockoutPicks[102] }) }
};

function getWildcardForSlot(slotIdx) {
  return state.thirdPlaceQualifiers[slotIdx] || null;
}

function clearKnockoutTreeDependentSlots() {
  let changed = true;
  while (changed) {
    changed = false;
    for (const [matchId, match] of Object.entries(KNOCKOUT_MATCHES)) {
      const picks = match.resolve();
      const currentWinner = state.knockoutPicks[matchId];
      if (currentWinner && (currentWinner !== picks.a && currentWinner !== picks.b)) {
        delete state.knockoutPicks[matchId];
        if (state.knockoutScores[matchId]) {
          state.knockoutScores[matchId].pWinner = "";
        }
        changed = true;
      }
    }
  }
}


// --- 13. POSTER DRAWING & PNG EXPORTER ---
DOM.btnFooterDownload.addEventListener("click", drawPosterPNG);
DOM.btnPodiumDownloadPoster.addEventListener("click", drawPosterPNG);

function drawPosterPNG() {
  const canvas = document.getElementById("poster-canvas");
  const ctx = canvas.getContext("2d");
  
  canvas.width = 1200;
  canvas.height = 800;
  
  // Back pitch
  ctx.fillStyle = "#090f1d";
  ctx.fillRect(0, 0, 1200, 800);
  
  const radGrd = ctx.createRadialGradient(600, 300, 100, 600, 400, 700);
  radGrd.addColorStop(0, "rgba(16, 185, 129, 0.2)");
  radGrd.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = radGrd;
  ctx.fillRect(0, 0, 1200, 800);
  
  // Gold borders
  ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
  ctx.lineWidth = 14;
  ctx.strokeRect(0, 0, 1200, 800);

  // Main Header
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "800 48px Outfit, Inter, sans-serif";
  ctx.fillText("FIFA WORLD CUP 2026", 600, 90);
  
  ctx.fillStyle = "#f59e0b";
  ctx.font = "700 20px Outfit, Inter, sans-serif";
  ctx.fillText("SEQUENTIAL SIMULATOR CHAMPION POSE", 600, 130);
  
  // Check completed champion
  const championId = state.knockoutPicks[104];
  if (!championId) {
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "600 24px Inter, sans-serif";
    ctx.fillText("Crown a Champion to download Champion Poster!", 600, 400);
    showToast("Please crown a champion first!", true);
    return;
  }
  
  const champ = TEAMS_DB[championId];
  const finalMatches = KNOCKOUT_MATCHES[104].resolve();
  const runnerId = championId === finalMatches.a ? finalMatches.b : finalMatches.a;
  const runner = runnerId ? TEAMS_DB[runnerId] : null;
  const thirdId = state.knockoutPicks[103];
  const third = thirdId ? TEAMS_DB[thirdId] : null;

  // Podium Blocks
  // Center: 1st
  ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
  ctx.fillRect(475, 340, 250, 260);
  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 3;
  ctx.strokeRect(475, 340, 250, 260);
  
  ctx.fillStyle = "#f59e0b";
  ctx.font = "800 120px Outfit, sans-serif";
  ctx.fillText("1", 600, 520);
  ctx.font = "700 16px Inter, sans-serif";
  ctx.fillText("CHAMPION", 600, 565);

  ctx.font = "800 68px Arial, sans-serif";
  ctx.fillText(champ.flag, 600, 260);
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 36px Outfit, sans-serif";
  ctx.fillText(champ.name.toUpperCase(), 600, 315);
  
  // Left: 2nd
  ctx.fillStyle = "rgba(192, 192, 192, 0.1)";
  ctx.fillRect(225, 400, 250, 200);
  ctx.strokeStyle = "#c0c0c0";
  ctx.strokeRect(225, 400, 250, 200);
  
  ctx.fillStyle = "#c0c0c0";
  ctx.font = "800 90px Outfit, sans-serif";
  ctx.fillText("2", 337, 520);
  ctx.font = "700 16px Inter, sans-serif";
  ctx.fillText("RUNNER-UP", 337, 565);
  
  if (runner) {
    ctx.font = "800 50px Arial, sans-serif";
    ctx.fillText(runner.flag, 337, 320);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 24px Outfit, sans-serif";
    ctx.fillText(runner.name.toUpperCase(), 337, 365);
  }

  // Right: 3rd
  ctx.fillStyle = "rgba(205, 127, 50, 0.1)";
  ctx.fillRect(725, 440, 250, 160);
  ctx.strokeStyle = "#cd7f32";
  ctx.strokeRect(725, 440, 250, 160);
  
  ctx.fillStyle = "#cd7f32";
  ctx.font = "800 80px Outfit, sans-serif";
  ctx.fillText("3", 850, 530);
  ctx.font = "700 16px Inter, sans-serif";
  ctx.fillText("THIRD PLACE", 850, 570);
  
  if (third) {
    ctx.font = "800 50px Arial, sans-serif";
    ctx.fillText(third.flag, 850, 360);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 24px Outfit, sans-serif";
    ctx.fillText(third.name.toUpperCase(), 850, 405);
  }

  // Footer labels on image
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "500 13px Inter, sans-serif";
  ctx.fillText("Generated with the 2026 World Cup Game-by-Game Simulator", 600, 715);

  const dataURL = canvas.toDataURL("image/png");
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataURL);
  downloadAnchor.setAttribute("download", `simulation_champs_2026.png`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Poster PNG downloaded successfully!");
}


// --- 14. 60FPS CONFETTI Visual FX ENGINE ---
let confettiActive = false;
let confettiParticles = [];
const confettiColors = ["#f59e0b", "#d97706", "#fcd34d", "#10b981", "#059669", "#ffffff"];

function triggerCelebratoryConfetti() {
  if (confettiActive) return;
  confettiActive = true;
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  confettiParticles = [];
  for (let i = 0; i < 140; i++) {
    confettiParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height - 20,
      size: Math.random() * 8 + 6,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      speedY: Math.random() * 4 + 3,
      speedX: Math.random() * 2 - 1,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 4 - 2
    });
  }

  function animate() {
    if (!confettiActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeCount = 0;
    
    confettiParticles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
      
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;
      if (p.y < canvas.height) activeCount++;
    });

    if (activeCount > 0) {
      requestAnimationFrame(animate);
    } else {
      confettiActive = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  const canvas = document.getElementById("confetti-canvas");
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});


// --- 14. DYNAMIC GOALSCORERS & AI COMMENTARY ENGINE ---
function renderMatchGoalscorers(matchKey, teamAId, teamBId, scoreA, scoreB, containerEl) {
  if (!containerEl) return;
  containerEl.innerHTML = "";

  const goalsA = parseInt(scoreA) || 0;
  const goalsB = parseInt(scoreB) || 0;

  if (goalsA === 0 && goalsB === 0) {
    containerEl.classList.add("hidden");
    containerEl.style.display = "none";
    return;
  }
  containerEl.classList.remove("hidden");
  containerEl.style.display = "flex";

  // Retrieve or initialize goalscorers state for this match
  if (!state.goalscorers[matchKey]) {
    state.goalscorers[matchKey] = { teamA: [], teamB: [] };
  }
  const matchScorers = state.goalscorers[matchKey];

  const teamA = TEAMS_DB[teamAId];
  const teamB = TEAMS_DB[teamBId];

  // Helper to build a goalscorer dropdown column
  function createScorersColumn(team, goalsCount, currentScorersArray, teamRole) {
    const col = document.createElement("div");
    col.className = `scorers-col scorers-${teamRole}`;
    
    if (goalsCount > 0) {
      const title = document.createElement("div");
      title.className = "scorers-col-title";
      title.innerHTML = `${team ? team.flag : "🏳️"} <span>${team ? team.name : "Team"} Goals:</span>`;
      col.appendChild(title);
    }

    const stars = team ? (team.stars || []) : [];

    for (let i = 0; i < goalsCount; i++) {
      // Auto-fill fallback with stars cycling
      if (!currentScorersArray[i]) {
        currentScorersArray[i] = stars[i % stars.length] || "Unknown Scorer";
      }

      const row = document.createElement("div");
      row.className = "scorer-select-row";

      const ballIcon = document.createElement("i");
      ballIcon.className = "fa-solid fa-futbol scorer-icon";
      row.appendChild(ballIcon);

      const select = document.createElement("select");
      select.className = "scorer-dropdown-select glass-input";
      select.disabled = state.isViewer;

      // Populate options
      stars.forEach(star => {
        const opt = document.createElement("option");
        opt.value = star;
        opt.innerText = star;
        if (star === currentScorersArray[i]) opt.selected = true;
        select.appendChild(opt);
      });

      // Other player option
      const otherOpt = document.createElement("option");
      otherOpt.value = "Other Player";
      otherOpt.innerText = "Other Player";
      if (currentScorersArray[i] === "Other Player") otherOpt.selected = true;
      select.appendChild(otherOpt);

      // Own goal option
      const ogOpt = document.createElement("option");
      ogOpt.value = "Own Goal";
      ogOpt.innerText = "Own Goal (OG)";
      if (currentScorersArray[i] === "Own Goal") ogOpt.selected = true;
      select.appendChild(ogOpt);

      select.addEventListener("change", (e) => {
        currentScorersArray[i] = e.target.value;
        saveToLocalStorage();
      });

      row.appendChild(select);
      col.appendChild(row);
    }

    // Truncate scorers array to the goalsCount
    currentScorersArray.length = goalsCount;

    return col;
  }

  if (teamA) {
    containerEl.appendChild(createScorersColumn(teamA, goalsA, matchScorers.teamA, "left"));
  }
  if (teamB) {
    containerEl.appendChild(createScorersColumn(teamB, goalsB, matchScorers.teamB, "right"));
  }
}

// Anthropic AI Commentary fetcher
async function fetchAICommentary(matchKey, teamAId, teamBId, contentEl) {
  if (!teamAId || !teamBId) {
    contentEl.innerHTML = `<div class="ai-commentary-error">Teams are not yet decided for this knockout clash!</div>`;
    contentEl.classList.remove("hidden");
    return;
  }

  const teamA = TEAMS_DB[teamAId];
  const teamB = TEAMS_DB[teamBId];

  contentEl.innerHTML = `<div class="ai-loader"><i class="fa-solid fa-circle-notch fa-spin"></i> Analyzing form and historical records...</div>`;
  contentEl.classList.remove("hidden");

  // Fallback if no API key is specified
  if (!getAnthropicKey().trim()) {
    // Generate deterministic rich local facts
    setTimeout(() => {
      const commentary = generateLocalCommentaryFallback(teamAId, teamBId);
      contentEl.innerHTML = `<div class="ai-commentary-text local-fallback">
        <span class="ai-tag">LOCAL PREVIEW</span>
        ${commentary}
      </div>`;
    }, 600);
    return;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": getAnthropicKey(),
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-api-key-allowed": "true",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: `Write a punchy 2-line pre-match preview for a World Cup clash: ${teamA.name} (FIFA Rank ${teamA.rank}, star player ${teamA.stars[0]}) vs ${teamB.name} (FIFA Rank ${teamB.rank}, star player ${teamB.stars[0]}). Highlight their styles, ranks, and key stars.`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const txt = data.content[0].text;
    contentEl.innerHTML = `<div class="ai-commentary-text">
      <span class="ai-tag"><i class="fa-solid fa-microchip-ai"></i> CLAUDE PREVIEW</span>
      ${txt.replace(/\n/g, "<br>")}
    </div>`;
  } catch (err) {
    console.error("Claude API call failed, running local fallback:", err);
    const commentary = generateLocalCommentaryFallback(teamAId, teamBId);
    contentEl.innerHTML = `<div class="ai-commentary-text local-fallback">
      <span class="ai-tag">PREVIEW</span>
      ${commentary}
    </div>`;
  }
}

// Local facts fallback generator
function generateLocalCommentaryFallback(teamAId, teamBId) {
  const teamA = TEAMS_DB[teamAId];
  const teamB = TEAMS_DB[teamBId];
  
  if (!teamA || !teamB) return "Matchup pending final classifications.";

  const hostBonusA = ["mex", "can", "usa"].includes(teamAId) ? " (Tournament Hosts)" : "";
  const hostBonusB = ["mex", "can", "usa"].includes(teamBId) ? " (Tournament Hosts)" : "";

  const facts = [
    `${teamA.name}${hostBonusA} (Rank #${teamA.rank}) locks horns with ${teamB.name}${hostBonusB} (Rank #${teamB.rank}) in a crucial matchup. ${teamA.name} will rely heavily on the elite skills of ${teamA.stars[0]}, while the opposition will lean on ${teamB.stars[0]} to control the tempo.`,
    `${teamA.history} Contrastingly, ${teamB.name} relies on a distinct pedigree: ${teamB.history} Keep a sharp eye on ${teamA.stars[0]} and ${teamB.stars[0]} as they battle for dominance in this decisive clash.`
  ];
  return facts.join("<br>");
}


// Recalculate each team's simulated path difficulty based on FIFA opponents' ranks
function renderPathDifficultyChart() {
  if (!DOM.difficultyChartList) return;
  DOM.difficultyChartList.innerHTML = "";

  // 1. Compile the set of 32 teams that have made it to R32
  const activeR32Teams = new Set();
  for (let mId = 73; mId <= 88; mId++) {
    const res = KNOCKOUT_MATCHES[mId].resolve();
    if (res.a) activeR32Teams.add(res.a);
    if (res.b) activeR32Teams.add(res.b);
  }

  if (activeR32Teams.size === 0) {
    DOM.difficultyChartList.innerHTML = `<div class="sidebar-help-text" style="text-align: center; margin-top: 20px;"><i class="fa-solid fa-hourglass-half"></i> Advance teams to the Round of 32 to calculate simulated path difficulty!</div>`;
    return;
  }

  const SIBLINGS_MAP = {
    73: 75, 75: 73, 74: 77, 77: 74, 76: 78, 78: 76, 79: 80, 80: 79,
    81: 82, 82: 81, 83: 84, 84: 83, 85: 87, 87: 85, 86: 88, 88: 86,
    90: 89, 89: 90, 91: 92, 92: 91, 94: 93, 93: 94, 96: 95, 95: 96,
    97: 98, 98: 97, 99: 100, 100: 99, 101: 102, 102: 101
  };

  const PARENTS_TO_NEXT = {
    // R32 -> R16
    73: 90, 75: 90, 74: 89, 77: 89, 76: 91, 78: 91, 79: 92, 80: 92,
    83: 93, 84: 93, 81: 94, 82: 94, 86: 95, 88: 95, 85: 96, 87: 96,
    // R16 -> QF
    89: 97, 90: 97, 93: 98, 94: 98, 91: 99, 92: 99, 95: 100, 96: 100,
    // QF -> SF
    97: 101, 98: 101, 99: 102, 100: 102,
    // SF -> Final
    101: 104, 102: 104
  };

  const difficulties = [];

  activeR32Teams.forEach(teamId => {
    let sumRanks = 0;

    // Find R32 Match
    let m32Id = null;
    for (let mId = 73; mId <= 88; mId++) {
      const res = KNOCKOUT_MATCHES[mId].resolve();
      if (res.a === teamId || res.b === teamId) {
        m32Id = mId;
        break;
      }
    }

    if (m32Id !== null) {
      // 1. R32 Opponent
      const res32 = KNOCKOUT_MATCHES[m32Id].resolve();
      const opp32Id = res32.a === teamId ? res32.b : res32.a;
      sumRanks += opp32Id ? TEAMS_DB[opp32Id].rank : 40;

      // 2. Projected R16 Opponent
      const sib32Id = SIBLINGS_MAP[m32Id];
      const sib32Winner = state.knockoutPicks[sib32Id] || KNOCKOUT_MATCHES[sib32Id].resolve().a;
      sumRanks += sib32Winner ? TEAMS_DB[sib32Winner].rank : 40;

      // 3. Projected QF Opponent
      const m16Id = PARENTS_TO_NEXT[m32Id];
      if (m16Id) {
        const sib16Id = SIBLINGS_MAP[m16Id];
        const sib16Winner = state.knockoutPicks[sib16Id] || KNOCKOUT_MATCHES[sib16Id].resolve().a;
        sumRanks += sib16Winner ? TEAMS_DB[sib16Winner].rank : 40;

        // 4. Projected SF Opponent
        const mQFId = PARENTS_TO_NEXT[m16Id];
        if (mQFId) {
          const sibQFId = SIBLINGS_MAP[mQFId];
          const sibQFWinner = state.knockoutPicks[sibQFId] || KNOCKOUT_MATCHES[sibQFId].resolve().a;
          sumRanks += sibQFWinner ? TEAMS_DB[sibQFWinner].rank : 40;

          // 5. Projected Final Opponent
          const mSFId = PARENTS_TO_NEXT[mQFId];
          if (mSFId) {
            const sibSFId = SIBLINGS_MAP[mSFId];
            const sibSFWinner = state.knockoutPicks[sibSFId] || KNOCKOUT_MATCHES[sibSFId].resolve().a;
            sumRanks += sibSFWinner ? TEAMS_DB[sibSFWinner].rank : 40;
          }
        }
      }
    }

    // Difficulty score: 450 - sum of ranks (lower ranks mean tougher opponents). Clamped to >= 10.
    const difficultyScore = Math.max(10, 450 - sumRanks);
    difficulties.push({ teamId, difficultyScore, rawSum: sumRanks });
  });

  // Sort by difficultyScore descending (hardest path first)
  difficulties.sort((a, b) => b.difficultyScore - a.difficultyScore);

  const maxVal = Math.max(...difficulties.map(d => d.difficultyScore)) || 1;

  difficulties.slice(0, 15).forEach((d, idx) => {
    const team = TEAMS_DB[d.teamId];
    const percent = Math.round((d.difficultyScore / maxVal) * 100);

    const row = document.createElement("div");
    row.className = "difficulty-row";
    row.innerHTML = `
      <div class="difficulty-row-meta">
        <span class="diff-rank">#${idx + 1}</span>
        <span class="diff-flag">${team.flag}</span>
        <span class="diff-name">${team.name}</span>
        <span class="diff-score" title="Power index based on opponents' rank">${d.difficultyScore}</span>
      </div>
      <div class="difficulty-bar-bg">
        <div class="difficulty-bar-fill" style="width: ${percent}%;"></div>
      </div>
    `;
    DOM.difficultyChartList.appendChild(row);
  });
}


// --- 14.5 MULTI-BRACKET VERSION MANAGER ---
function saveBracketSlot(slotIdx) {
  if (state.isViewer) return;
  const snapshot = {
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    gScores: JSON.parse(JSON.stringify(state.groupMatchScores)),
    kScores: JSON.parse(JSON.stringify(state.knockoutScores)),
    kPicks: JSON.parse(JSON.stringify(state.knockoutPicks)),
    thirds: JSON.parse(JSON.stringify(state.thirdPlaceQualifiers)),
    goalscorers: JSON.parse(JSON.stringify(state.goalscorers))
  };
  localStorage.setItem(`wc_bracket_save_slot_${slotIdx}`, JSON.stringify(snapshot));
  updateBracketSlotUI();
  showToast(`Predictions saved successfully to Slot ${slotIdx}!`);
}

function loadBracketSlot(slotIdx) {
  const data = localStorage.getItem(`wc_bracket_save_slot_${slotIdx}`);
  if (!data) return;
  
  if (confirm(`Load predictions from Slot ${slotIdx}? Any unsaved changes in your current view will be lost.`)) {
    try {
      const snapshot = JSON.parse(data);
      state.groupMatchScores = snapshot.gScores || {};
      state.knockoutScores = snapshot.kScores || {};
      state.knockoutPicks = snapshot.kPicks || {};
      state.thirdPlaceQualifiers = snapshot.thirds || [];
      state.goalscorers = snapshot.goalscorers || {};

      recalculateAllGroupStandings();
      renderSidebarStandings();
      
      // Auto-jump to the current active step in this loaded bracket
      if (state.wizardStep === "welcome") {
        state.wizardStep = "md1";
      }
      switchWizardStep(state.wizardStep);
      
      updateBracketSlotUI();
      showToast(`Slot ${slotIdx} loaded successfully!`);
      saveToLocalStorage();
    } catch (e) {
      console.error("Load slot failed:", e);
      showToast("Failed to load bracket slot.", true);
    }
  }
}

function updateBracketSlotUI() {
  let filledCount = 0;
  for (let i = 1; i <= 3; i++) {
    const data = localStorage.getItem(`wc_bracket_save_slot_${i}`);
    const statusEl = document.getElementById(`slot-status-${i}`);
    const loadBtn = document.getElementById(`btn-load-${i}`);
    if (data) {
      filledCount++;
      const snapshot = JSON.parse(data);
      if (statusEl) {
        statusEl.innerText = `Saved (${snapshot.timestamp})`;
        statusEl.style.color = "var(--emerald-500)";
      }
      if (loadBtn) loadBtn.classList.remove("hidden");
    } else {
      if (statusEl) {
        statusEl.innerText = "Empty";
        statusEl.style.color = "var(--text-muted)";
      }
      if (loadBtn) loadBtn.classList.add("hidden");
    }
  }

  const compareBtn = document.getElementById("btn-compare-brackets");
  if (compareBtn) {
    if (filledCount >= 2) {
      compareBtn.classList.remove("disabled");
      compareBtn.style.pointerEvents = "auto";
      compareBtn.style.opacity = "1";
    } else {
      compareBtn.classList.add("disabled");
      compareBtn.style.pointerEvents = "none";
      compareBtn.style.opacity = "0.5";
    }
  }
}

function renderMultiBracketComparison() {
  if (!DOM.compareTbody) return;
  DOM.compareTbody.innerHTML = "";

  // 1. Gather all slots
  const slots = {};
  for (let i = 1; i <= 3; i++) {
    const data = localStorage.getItem(`wc_bracket_save_slot_${i}`);
    if (data) {
      slots[i] = JSON.parse(data);
    }
  }

  const activeSlots = Object.keys(slots);
  if (activeSlots.length < 2) return;

  // Render comparison rows
  // A. Group Matches Comparison (Matches 1 to 72)
  const allGroupMatches = [];
  ["md1", "md2", "md3"].forEach(md => {
    GROUP_STAGE_MATCHES[md].forEach(m => {
      allGroupMatches.push(m);
    });
  });

  allGroupMatches.forEach(m => {
    const key = `${m.group}_${m.matchIndex}`;
    const teamA = TEAMS_DB[m.teamA];
    const teamB = TEAMS_DB[m.teamB];

    // Get predictions for each slot
    const predictions = {};
    activeSlots.forEach(sIdx => {
      const score = slots[sIdx].gScores[key];
      if (score && score.scoreA !== "" && score.scoreB !== "") {
        predictions[sIdx] = `${score.scoreA}-${score.scoreB}`;
      } else {
        predictions[sIdx] = "Not Predicted";
      }
    });

    // Check divergence
    const uniquePreds = new Set(Object.values(predictions));
    const diverged = uniquePreds.size > 1;

    const tr = document.createElement("tr");
    if (diverged) tr.className = "diverged-row";
    tr.style.borderBottom = "1px solid rgba(255,255,255,0.02)";

    tr.innerHTML = `
      <td style="padding: 8px 10px; font-size: 0.78rem;">
        <span class="compare-match-label" style="color: var(--gold-400); font-size: 0.68rem; font-weight: 700; display: block;">GROUP ${m.group}</span>
        ${teamA.flag} ${teamA.name} vs ${teamB.name} ${teamB.flag}
      </td>
      <td style="text-align: center; padding: 8px; font-size: 0.78rem;">${predictions[1] || "-"}</td>
      <td style="text-align: center; padding: 8px; font-size: 0.78rem;">${predictions[2] || "-"}</td>
      <td style="text-align: center; padding: 8px; font-size: 0.78rem;">${predictions[3] || "-"}</td>
      <td style="text-align: center; padding: 8px; font-size: 0.78rem;">
        ${diverged ? `<span class="badge-diverged" style="background: rgba(245, 158, 11, 0.2); color: var(--gold-400); font-weight: 700; font-size: 0.62rem; padding: 2px 6px; border-radius: 4px;">Diverged</span>` : `<span style="color: var(--text-muted); font-size: 0.7rem;">Same</span>`}
      </td>
    `;
    DOM.compareTbody.appendChild(tr);
  });

  // B. Knockout Matches Comparison (Matches 73 to 104)
  for (let mId = 73; mId <= 104; mId++) {
    const match = KNOCKOUT_MATCHES[mId];
    
    // Get winner predicted for each slot
    const predictions = {};
    activeSlots.forEach(sIdx => {
      const winnerId = slots[sIdx].kPicks[mId];
      if (winnerId) {
        const team = TEAMS_DB[winnerId];
        predictions[sIdx] = team ? `${team.flag} ${team.name}` : "Undecided";
      } else {
        predictions[sIdx] = "Undecided";
      }
    });

    const uniquePreds = new Set(Object.values(predictions));
    const diverged = uniquePreds.size > 1;

    const tr = document.createElement("tr");
    if (diverged) tr.className = "diverged-row";
    tr.style.borderBottom = "1px solid rgba(255,255,255,0.02)";

    tr.innerHTML = `
      <td style="padding: 8px 10px; font-size: 0.78rem;">
        <span class="compare-match-label" style="color: var(--emerald-500); font-size: 0.68rem; font-weight: 700; display: block;">MATCH ${mId} (${match.label.split(":")[0]})</span>
        ${match.label.split(":")[1] || match.label}
      </td>
      <td style="text-align: center; padding: 8px; font-size: 0.78rem;">${predictions[1] || "-"}</td>
      <td style="text-align: center; padding: 8px; font-size: 0.78rem;">${predictions[2] || "-"}</td>
      <td style="text-align: center; padding: 8px; font-size: 0.78rem;">${predictions[3] || "-"}</td>
      <td style="text-align: center; padding: 8px; font-size: 0.78rem;">
        ${diverged ? `<span class="badge-diverged" style="background: rgba(245, 158, 11, 0.2); color: var(--gold-400); font-weight: 700; font-size: 0.62rem; padding: 2px 6px; border-radius: 4px;">Diverged</span>` : `<span style="color: var(--text-muted); font-size: 0.7rem;">Same</span>`}
      </td>
    `;
    DOM.compareTbody.appendChild(tr);
  }
}


// --- 14.6 PREDICTION ACCURACY TRACKER ENGINE ---
function evaluateAccuracy() {
  if (!state.actualResults || !DOM.accuracySummaryBox) return;

  let totalPoints = 0;
  let exactCount = 0;
  let winnerCount = 0;
  let totalEvaluated = 0;

  // A. Evaluate Group Stage (Matches 1 to 72)
  const mdList = ["md1", "md2", "md3"];
  mdList.forEach(md => {
    GROUP_STAGE_MATCHES[md].forEach(m => {
      const key = `${m.group}_${m.matchIndex}`;
      const pred = state.groupMatchScores[key];
      const actual = state.actualResults.groupMatchScores[key];

      if (pred && pred.scoreA !== "" && pred.scoreB !== "" &&
          actual && actual.scoreA !== "" && actual.scoreB !== "") {
        totalEvaluated++;
        const pA = parseInt(pred.scoreA);
        const pB = parseInt(pred.scoreB);
        const aA = parseInt(actual.scoreA);
        const aB = parseInt(actual.scoreB);

        // Check exact match
        if (pA === aA && pB === aB) {
          totalPoints += 5;
          exactCount++;
          winnerCount++;
        } else {
          // Check outcome (winner or draw)
          const predOutcome = pA > pB ? "A" : pA < pB ? "B" : "D";
          const actualOutcome = aA > aB ? "A" : aA < aB ? "B" : "D";
          if (predOutcome === actualOutcome) {
            totalPoints += 3;
            winnerCount++;
          }
        }
      }
    });
  });

  // B. Evaluate Knockout Stage (Matches 73 to 104)
  for (let mId = 73; mId <= 104; mId++) {
    const pred = state.knockoutScores[mId];
    const predWinner = state.knockoutPicks[mId];
    const actual = state.actualResults.knockoutScores[mId];
    const actualWinner = state.actualResults.knockoutPicks[mId];

    if (pred && pred.scoreA !== "" && pred.scoreB !== "" &&
        actual && actual.scoreA !== "" && actual.scoreB !== "") {
      totalEvaluated++;
      const pA = parseInt(pred.scoreA);
      const pB = parseInt(pred.scoreB);
      const aA = parseInt(actual.scoreA);
      const aB = parseInt(actual.scoreB);

      // Check exact match
      if (pA === aA && pB === aB && predWinner === actualWinner) {
        totalPoints += 5;
        exactCount++;
        winnerCount++;
      } else {
        // Check outcome (advancing team)
        if (predWinner === actualWinner) {
          totalPoints += 3;
          winnerCount++;
        }
      }
    }
  }

  // Update UI values
  DOM.accScore.innerText = totalPoints;
  DOM.accExact.innerText = `${exactCount} / ${totalEvaluated}`;
  DOM.accWinners.innerText = `${winnerCount} / ${totalEvaluated}`;
  DOM.accuracySummaryBox.classList.remove("hidden");
}

function loadDemoActualResults() {
  // Clone current state predictions
  const demo = {
    groupMatchScores: JSON.parse(JSON.stringify(state.groupMatchScores)),
    knockoutScores: JSON.parse(JSON.stringify(state.knockoutScores)),
    knockoutPicks: JSON.parse(JSON.stringify(state.knockoutPicks))
  };

  // Introduce variations to make it a realistic prediction evaluation
  let idx = 0;
  Object.keys(demo.groupMatchScores).forEach(key => {
    const score = demo.groupMatchScores[key];
    if (score && score.scoreA !== "" && score.scoreB !== "") {
      idx++;
      if (idx % 6 === 0) {
        // Add a goal to Team A
        score.scoreA = (parseInt(score.scoreA) + 1).toString();
      } else if (idx % 9 === 0) {
        // Flip the winner
        const temp = score.scoreA;
        score.scoreA = score.scoreB;
        score.scoreB = temp;
      }
    }
  });

  Object.keys(demo.knockoutScores).forEach(mId => {
    const score = demo.knockoutScores[mId];
    if (score && score.scoreA !== "" && score.scoreB !== "") {
      idx++;
      if (idx % 4 === 0) {
        score.scoreA = (parseInt(score.scoreA) + 1).toString();
        const resolved = KNOCKOUT_MATCHES[mId].resolve();
        // Recalculate pick
        demo.knockoutPicks[mId] = parseInt(score.scoreA) > parseInt(score.scoreB) ? resolved.a : resolved.b;
      }
    }
  });

  state.actualResults = demo;
  evaluateAccuracy();
  showToast("Demo actual results loaded successfully!");
}

function renderAccuracyBreakdown() {
  if (!DOM.accuracyTbody || !state.actualResults) return;
  DOM.accuracyTbody.innerHTML = "";

  // Process Group Matches
  const allGroupMatches = [];
  ["md1", "md2", "md3"].forEach(md => {
    GROUP_STAGE_MATCHES[md].forEach(m => {
      allGroupMatches.push(m);
    });
  });

  allGroupMatches.forEach(m => {
    const key = `${m.group}_${m.matchIndex}`;
    const teamA = TEAMS_DB[m.teamA];
    const teamB = TEAMS_DB[m.teamB];

    const pred = state.groupMatchScores[key];
    const actual = state.actualResults.groupMatchScores[key];

    let predText = "Not Predicted";
    let actualText = "No Result";
    let scoreEarned = 0;
    let badgeClass = "badge-incorrect";
    let badgeText = "Incorrect";

    if (pred && pred.scoreA !== "" && pred.scoreB !== "") {
      predText = `${pred.scoreA} - ${pred.scoreB}`;
    }
    if (actual && actual.scoreA !== "" && actual.scoreB !== "") {
      actualText = `${actual.scoreA} - ${actual.scoreB}`;
    }

    if (pred && pred.scoreA !== "" && pred.scoreB !== "" &&
        actual && actual.scoreA !== "" && actual.scoreB !== "") {
      const pA = parseInt(pred.scoreA);
      const pB = parseInt(pred.scoreB);
      const aA = parseInt(actual.scoreA);
      const aB = parseInt(actual.scoreB);

      if (pA === aA && pB === aB) {
        scoreEarned = 5;
        badgeClass = "badge-exact";
        badgeText = "+5 Pts (Exact)";
      } else {
        const predOutcome = pA > pB ? "A" : pA < pB ? "B" : "D";
        const actualOutcome = aA > aB ? "A" : aA < aB ? "B" : "D";
        if (predOutcome === actualOutcome) {
          scoreEarned = 3;
          badgeClass = "badge-outcome";
          badgeText = "+3 Pts (Outcome)";
        } else {
          scoreEarned = 0;
          badgeClass = "badge-incorrect";
          badgeText = "0 Pts";
        }
      }
    }

    const tr = document.createElement("tr");
    tr.className = scoreEarned === 5 ? "acc-exact-row" : scoreEarned === 3 ? "acc-outcome-row" : "acc-incorrect-row";
    tr.style.borderBottom = "1px solid rgba(255,255,255,0.02)";

    tr.innerHTML = `
      <td style="padding: 8px 10px; font-size: 0.78rem;">
        <span class="compare-match-label" style="color: var(--gold-400); font-size: 0.68rem; font-weight: 700; display: block;">GROUP ${m.group}</span>
        ${teamA.flag} ${teamA.name} vs ${teamB.name} ${teamB.flag}
      </td>
      <td style="text-align: center; padding: 8px; font-size: 0.78rem; font-weight: 600;">${predText}</td>
      <td style="text-align: center; padding: 8px; font-size: 0.78rem; font-weight: 600; color: var(--gold-400);">${actualText}</td>
      <td style="text-align: center; padding: 8px; font-size: 0.78rem;">
        <span class="acc-points-badge ${badgeClass}">${badgeText}</span>
      </td>
    `;
    DOM.accuracyTbody.appendChild(tr);
  });

  // Process Knockouts
  for (let mId = 73; mId <= 104; mId++) {
    const match = KNOCKOUT_MATCHES[mId];
    const pred = state.knockoutScores[mId];
    const predWinnerId = state.knockoutPicks[mId];
    const actual = state.actualResults.knockoutScores[mId];
    const actualWinnerId = state.actualResults.knockoutPicks[mId];

    let predText = "Not Predicted";
    let actualText = "No Result";
    let scoreEarned = 0;
    let badgeClass = "badge-incorrect";
    let badgeText = "Incorrect";

    if (pred && pred.scoreA !== "" && pred.scoreB !== "") {
      const wTeam = TEAMS_DB[predWinnerId];
      predText = `${pred.scoreA}-${pred.scoreB}` + (wTeam ? ` (${wTeam.flag})` : "");
    }
    if (actual && actual.scoreA !== "" && actual.scoreB !== "") {
      const wTeam = TEAMS_DB[actualWinnerId];
      actualText = `${actual.scoreA}-${actual.scoreB}` + (wTeam ? ` (${wTeam.flag})` : "");
    }

    if (pred && pred.scoreA !== "" && pred.scoreB !== "" &&
        actual && actual.scoreA !== "" && actual.scoreB !== "") {
      const pA = parseInt(pred.scoreA);
      const pB = parseInt(pred.scoreB);
      const aA = parseInt(actual.scoreA);
      const aB = parseInt(actual.scoreB);

      if (pA === aA && pB === aB && predWinnerId === actualWinnerId) {
        scoreEarned = 5;
        badgeClass = "badge-exact";
        badgeText = "+5 Pts (Exact)";
      } else if (predWinnerId === actualWinnerId) {
        scoreEarned = 3;
        badgeClass = "badge-outcome";
        badgeText = "+3 Pts (Outcome)";
      } else {
        scoreEarned = 0;
        badgeClass = "badge-incorrect";
        badgeText = "0 Pts";
      }
    }

    const tr = document.createElement("tr");
    tr.className = scoreEarned === 5 ? "acc-exact-row" : scoreEarned === 3 ? "acc-outcome-row" : "acc-incorrect-row";
    tr.style.borderBottom = "1px solid rgba(255,255,255,0.02)";

    tr.innerHTML = `
      <td style="padding: 8px 10px; font-size: 0.78rem;">
        <span class="compare-match-label" style="color: var(--emerald-500); font-size: 0.68rem; font-weight: 700; display: block;">MATCH ${mId} (${match.label.split(":")[0]})</span>
        ${match.label.split(":")[1] || match.label}
      </td>
      <td style="text-align: center; padding: 8px; font-size: 0.78rem; font-weight: 600;">${predText}</td>
      <td style="text-align: center; padding: 8px; font-size: 0.78rem; font-weight: 600; color: var(--gold-400);">${actualText}</td>
      <td style="text-align: center; padding: 8px; font-size: 0.78rem;">
        <span class="acc-points-badge ${badgeClass}">${badgeText}</span>
      </td>
    `;
    DOM.accuracyTbody.appendChild(tr);
  }
}


// --- 15. BOOT ENGINE & HASH PARSER ---
window.addEventListener("DOMContentLoaded", async () => {
  initDOM();

  if (typeof SupabaseBracket !== "undefined") {
    SupabaseBracket.initSupabase();
  }

  bindSupabaseUi();
  void renderLeaderboard();

  initDefaultState();
  
  // Try loading from localStorage first (persistence)
  loadFromLocalStorage();

  // Override if shared link (#share= or ?share=) — full bracket in URL for GitHub Pages
  const shareCode = BracketShare.extractShareCodeFromPage();
  if (shareCode) {
    const result = BracketShare.decodeShareCode(shareCode);
    if (result.ok) {
      BracketShare.applyPayloadToState(state, result.payload);
      enterSharedViewerMode();
      if (result.payload.legacyKnockoutOnly) {
        showToast("Legacy link — knockout tree shown (group scores unavailable).");
      } else {
        showToast("Shared bracket loaded!");
      }
    } else {
      showToast("Could not read this share link.", true);
    }
  } else {
    await loadSubmittedBracketFromUrl();
  }

  // Set active tab hooks
  DOM.btnStartSimulation.addEventListener("click", () => switchWizardStep("md1"));
  
  // Stepper timelines click jumping
  DOM.stepNodes.forEach(node => {
    node.addEventListener("click", () => {
      const stepId = node.dataset.step;
      
      // Prevent skipping forward dynamically unless completed
      if (node.classList.contains("completed") || node.classList.contains("active")) {
        switchWizardStep(stepId);
      } else {
        // Can only jump if preceding step is completely satisfied
        const stepProgression = ["welcome", "md1", "md2", "md3", "r32", "r16", "qf", "sf", "final", "championship"];
        const targetIdx = stepProgression.indexOf(stepId);
        
        let precedingCompleted = true;
        
        // Quick verification of predecessor
        const prevStepId = stepProgression[targetIdx - 1];
        if (prevStepId) {
          if (prevStepId.startsWith("md")) {
            let count = 0;
            GROUP_STAGE_MATCHES[prevStepId].forEach(m => {
              const score = state.groupMatchScores[`${m.group}_${m.matchIndex}`];
              if (score && score.scoreA !== "" && score.scoreB !== "") count++;
            });
            precedingCompleted = (count === 24);
          } else {
            const roundMapping = {
              r32: { start: 73, end: 88 },
              r16: { start: 89, end: 96 },
              qf: { start: 97, end: 100 },
              sf: { start: 101, end: 102 }
            };
            const range = roundMapping[prevStepId];
            if (range) {
              let count = 0;
              for (let m = range.start; m <= range.end; m++) {
                if (state.knockoutPicks[m]) count++;
              }
              precedingCompleted = (count === (range.end - range.start + 1));
            }
          }
        }

        if (precedingCompleted && prevStepId) {
          switchWizardStep(stepId);
        } else {
          showToast("Complete preceding matches before advancing to this stage!", true);
        }
      }
    });
  });

  // Global resets
  DOM.btnReset.addEventListener("click", () => {
    if (state.isViewer) return;
    if (confirm("Are you sure you want to reset the simulation? All match scores will be wiped.")) {
      initDefaultState();
      localStorage.removeItem("wc_2026_simulator_save");
      window.location.hash = "";
      switchWizardStep("welcome");
      showToast("Simulation database cleared!");
    }
  });

  // Global auto-tabbing handler for score boxes
  document.addEventListener("input", (e) => {
    if (e.target.classList.contains("card-score-box")) {
      const val = e.target.value;
      if (val.length >= 1) {
        const inputs = Array.from(document.querySelectorAll(".card-score-box:not([disabled])"));
        const idx = inputs.indexOf(e.target);
        if (idx > -1 && idx < inputs.length - 1) {
          inputs[idx + 1].focus();
          inputs[idx + 1].select();
        }
      }
    }
  });

  // Settings Modal controls
  if (DOM.btnShowSettings) {
    DOM.btnShowSettings.addEventListener("click", () => {
      DOM.txtApiKey.value = getAnthropicKey();
      DOM.settingsModal.classList.remove("hidden");
    });
  }

  if (DOM.btnCloseSettings) {
    DOM.btnCloseSettings.addEventListener("click", () => {
      DOM.settingsModal.classList.add("hidden");
    });
  }

  if (DOM.btnSaveSettings) {
    DOM.btnSaveSettings.addEventListener("click", () => {
      setAnthropicKey(DOM.txtApiKey.value.trim());
      DOM.settingsModal.classList.add("hidden");
      showToast("Anthropic API Key saved successfully!");
    });
  }

  if (DOM.btnClearSettings) {
    DOM.btnClearSettings.addEventListener("click", () => {
      setAnthropicKey("");
      localStorage.removeItem("anthropic_key");
      DOM.txtApiKey.value = "";
      DOM.settingsModal.classList.add("hidden");
      showToast("Anthropic API Key cleared!");
    });
  }

  // Bracket Slots button click event hooks
  document.querySelectorAll(".btn-save-slot").forEach(btn => {
    btn.addEventListener("click", () => {
      const slot = parseInt(btn.dataset.slot);
      saveBracketSlot(slot);
    });
  });

  document.querySelectorAll(".btn-load-slot").forEach(btn => {
    btn.addEventListener("click", () => {
      const slot = parseInt(btn.dataset.slot);
      loadBracketSlot(slot);
    });
  });

  if (DOM.btnCompareBrackets) {
    DOM.btnCompareBrackets.addEventListener("click", () => {
      renderMultiBracketComparison();
      DOM.compareModal.classList.remove("hidden");
    });
  }

  if (DOM.btnCloseCompare) {
    DOM.btnCloseCompare.addEventListener("click", () => {
      DOM.compareModal.classList.add("hidden");
    });
  }

  // --- PREDICTION ACCURACY TRACKER EVENT LISTENERS ---
  if (DOM.btnLoadActualDemo) {
    DOM.btnLoadActualDemo.addEventListener("click", () => {
      loadDemoActualResults();
    });
  }

  if (DOM.btnUploadActualTrigger) {
    DOM.btnUploadActualTrigger.addEventListener("click", () => {
      if (DOM.fileActualResults) DOM.fileActualResults.click();
    });
  }

  if (DOM.fileActualResults) {
    DOM.fileActualResults.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data && data.groupMatchScores && data.knockoutScores && data.knockoutPicks) {
            state.actualResults = data;
            evaluateAccuracy();
            saveToLocalStorage();
            showToast("Actual results loaded successfully!");
          } else {
            showToast("Invalid results file schema.", true);
          }
        } catch {
          showToast("Failed to parse JSON file.", true);
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    });
  }

  if (DOM.btnClearActuals) {
    DOM.btnClearActuals.addEventListener("click", () => {
      state.actualResults = null;
      DOM.accuracySummaryBox.classList.add("hidden");
      saveToLocalStorage();
      showToast("Actual results cleared!");
    });
  }

  if (DOM.btnViewAccuracyBreakdown) {
    DOM.btnViewAccuracyBreakdown.addEventListener("click", () => {
      renderAccuracyBreakdown();
      if (DOM.accuracyModal) DOM.accuracyModal.classList.remove("hidden");
    });
  }

  if (DOM.btnCloseAccuracy) {
    DOM.btnCloseAccuracy.addEventListener("click", () => {
      if (DOM.accuracyModal) DOM.accuracyModal.classList.add("hidden");
    });
  }

  // Trigger evaluation on load if results exist
  if (state.actualResults) {
    evaluateAccuracy();
  }

  // Initialize slot displays
  updateBracketSlotUI();

  // Default step
  if (state.wizardStep && state.wizardStep !== "welcome") {
    switchWizardStep(state.wizardStep);
  } else {
    switchWizardStep("welcome");
  }
});
