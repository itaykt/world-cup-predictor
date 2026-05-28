/**
  Swipe Cup — World Cup Swipe Predictor Engine
  Gesture Tracking, background Standings Calculator & State Coordinator
*/

// --- 1. TEAMS DATABASE & STAGES DRAW SCHEDULES ---
const TEAMS_DB = {
  // Group A
  mex: { name: "Mexico", flag: "🇲🇽", rank: 15, stars: ["Santiago Giménez", "Edson Álvarez", "Luis Chávez"], history: "Co-hosts seeking to break the fifth-game curse." },
  rsa: { name: "South Africa", flag: "🇿🇦", rank: 59, stars: ["Percy Tau", "Teboho Mokoena", "Lyle Foster"], history: "Bafana Bafana returning to capture the magic of 2010." },
  kor: { name: "South Korea", flag: "🇰🇷", rank: 22, stars: ["Son Heung-min", "Kim Min-jae", "Lee Kang-in"], history: "Taegeuk Warriors looking to replicate 2002." },
  cze: { name: "Czechia", flag: "🇨🇿", rank: 40, stars: ["Patrik Schick", "Tomáš Souček", "Adam Hložek"], history: "Tactically rigid European side looking to surprise." },
  // Group B
  can: { name: "Canada", flag: "🇨🇦", rank: 48, stars: ["Alphonso Davies", "Jonathan David", "Tajon Buchanan"], history: "Co-hosts seeking first-ever knockout phase appearance." },
  bih: { name: "Bosnia & Herz.", flag: "🇧🇦", rank: 74, stars: ["Edin Džeko", "Miralem Pjanić", "Sead Kolašinac"], history: "Golden generation veterans aiming for one last tournament highlight." },
  qat: { name: "Qatar", flag: "🇶🇦", rank: 37, stars: ["Akram Afif", "Almoez Ali", "Boualem Khoukhi"], history: "Recent Asian champions hoping to prove their mettle." },
  sui: { name: "Switzerland", flag: "🇨🇭", rank: 19, stars: ["Granit Xhaka", "Manuel Akanji", "Breel Embolo"], history: "Famous for their giant-killing knockout capabilities." },
  // Group C
  bra: { name: "Brazil", flag: "🇧🇷", rank: 5, stars: ["Vinícius Júnior", "Rodrygo", "Neymar Jr"], history: "Five-time champions hunting relentlessly for their sixth star." },
  mar: { name: "Morocco", flag: "🇲🇦", rank: 13, stars: ["Achraf Hakimi", "Yassine Bounou", "Sofyan Amrabat"], history: "Historic 2022 semi-finalists proving they belong." },
  hai: { name: "Haiti", flag: "🇭🇹", rank: 86, stars: ["Frantzdy Pierrot", "Duckens Nazon", "Derrick Etienne"], history: "Caribbean underdogs looking to create monumental upsets." },
  sco: { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", rank: 36, stars: ["Scott McTominay", "John McGinn", "Andrew Robertson"], history: "Passionate squad aiming for historic group stage progression." },
  // Group D
  usa: { name: "United States", flag: "🇺🇸", rank: 11, stars: ["Christian Pulisic", "Weston McKennie", "Folarin Balogun"], history: "Co-hosts with an athletic young core primed for a deep run." },
  par: { name: "Paraguay", flag: "🇵🇾", rank: 56, stars: ["Miguel Almirón", "Julio Enciso", "Gustavo Gómez"], history: "Resilient South American side anchored by defensive grit." },
  aus: { name: "Australia", flag: "🇦🇺", rank: 23, stars: ["Mathew Ryan", "Craig Goodwin", "Jackson Irvine"], history: "Socceroos hoping to build on impressive 2022 run." },
  tur: { name: "Türkiye", flag: "🇹🇷", rank: 26, stars: ["Hakan Çalhanoğlu", "Arda Güler", "Kenan Yıldız"], history: "Exciting young generation dreaming of repeating 2002." },
  // Group E
  ger: { name: "Germany", flag: "🇩🇪", rank: 16, stars: ["Florian Wirtz", "Jamal Musiala", "Kai Havertz"], history: "Four-time champions rebuilding with world-class young playmakers." },
  cuw: { name: "Curaçao", flag: "🇨🇼", rank: 91, stars: ["Juninho Bacuna", "Leandro Bacuna", "Rangelo Janga"], history: "Caribbean islanders seeking to make their first big splash." },
  civ: { name: "Côte d'Ivoire", flag: "🇨🇮", rank: 38, stars: ["Sébastien Haller", "Franck Kessié", "Simon Adingra"], history: "Recent African champions possessing elite physical speed." },
  ecu: { name: "Ecuador", flag: "🇪🇨", rank: 31, stars: ["Moisés Caicedo", "Piero Hincapié", "Enner Valencia"], history: "Fearless Andean side with high altitude pace and resilience." },
  // Group F
  ned: { name: "Netherlands", flag: "🇳🇱", rank: 7, stars: ["Virgil van Dijk", "Cody Gakpo", "Frenkie de Jong"], history: "Oranje seeking to break their three-time finalist bridesmaid curse." },
  jpn: { name: "Japan", flag: "🇯🇵", rank: 18, stars: ["Kaoru Mitoma", "Takefusa Kubo", "Wataru Endo"], history: "Samurai Blue boasting high-octane press and precision." },
  swe: { name: "Sweden", flag: "🇸🇪", rank: 28, stars: ["Alexander Isak", "Dejan Kulusevski", "Viktor Gyökeres"], history: "Attackers looking to power a deep knockout run." },
  tun: { name: "Tunisia", flag: "🇹🇳", rank: 41, stars: ["Aissa Laïdouni", "Ellyes Skhiri", "Youssef Msakni"], history: "Carthage Eagles famous for defensive solidness." },
  // Group G
  bel: { name: "Belgium", flag: "🇧🇪", rank: 3, stars: ["Kevin De Bruyne", "Romelu Lukaku", "Jérémy Doku"], history: "Red Devils blending veteran geniuses with explosive wingers." },
  egy: { name: "Egypt", flag: "🇪🇬", rank: 30, stars: ["Mohamed Salah", "Mostafa Mohamed", "Omar Marmoush"], history: "Pharaohs led by a legendary winger hungry for global glory." },
  irn: { name: "IR Iran", flag: "🇮🇷", rank: 20, stars: ["Mehdi Taremi", "Sardar Azmoun", "Alireza Jahanbakhsh"], history: "Asian powerhouse featuring a lethal strike partnership." },
  nzl: { name: "New Zealand", flag: "🇳🇿", rank: 104, stars: ["Chris Wood", "Liberato Cacace", "Sarpreet Singh"], history: "OFC champions aiming to repeat 2010 undefeated run." },
  // Group H
  esp: { name: "Spain", flag: "🇪🇸", rank: 8, stars: ["Lamine Yamal", "Rodri", "Nico Williams"], history: "European champions playing breathtaking, modern football." },
  cpv: { name: "Cabo Verde", flag: "🇨🇻", rank: 65, stars: ["Ryan Mendes", "Garry Rodrigues", "Bebé"], history: "Blue Sharks seeking to continue giant-killing AFCON form." },
  ksa: { name: "Saudi Arabia", flag: "🇸🇦", rank: 53, stars: ["Salem Al-Dawsari", "Firas Al-Buraikan", "Abdulrahman Ghareeb"], history: "Remembered for upsetting Argentina in 2022." },
  ury: { name: "Uruguay", flag: "🇺🇾", rank: 14, stars: ["Federico Valverde", "Darwin Núñez", "Luis Suárez"], history: "Relentless high-press and legendary defensive grit." },
  // Group I
  fra: { name: "France", flag: "🇫🇷", rank: 2, stars: ["Kylian Mbappé", "Antoine Griezmann", "William Saliba"], history: "Pre-tournament favorites loaded with world-class depth." },
  sen: { name: "Senegal", flag: "🇸🇳", rank: 17, stars: ["Sadio Mané", "Nicolas Jackson", "Kalidou Koulibaly"], history: "Lions of Teranga looking to make Africa proud." },
  irq: { name: "Iraq", flag: "🇮🇶", rank: 58, stars: ["Aymen Hussein", "Ali Jasim", "Zidane Iqbal"], history: "Lions of Mesopotamia returning with dangerous attackers." },
  nor: { name: "Norway", flag: "🇳🇴", rank: 47, stars: ["Erling Haaland", "Martin Ødegaard", "Oscar Bobb"], history: "Boasting the world's most lethal striker and playmaker." },
  // Group J
  arg: { name: "Argentina", flag: "🇦🇷", rank: 1, stars: ["Lionel Messi", "Lautaro Martínez", "Julián Álvarez"], history: "Defending champions seeking Messi's perfect farewell." },
  dza: { name: "Algeria", flag: "🇩🇿", rank: 43, stars: ["Riyad Mahrez", "Saïd Benrahma", "Amine Gouiri"], history: "Desert Foxes possessing technical brilliance." },
  aut: { name: "Austria", flag: "🇦🇹", rank: 25, stars: ["Marcel Sabitzer", "Konrad Laimer", "Christoph Baumgartner"], history: "Intense high-pressing machine engineered for dominance." },
  jor: { name: "Jordan", flag: "🇯🇴", rank: 71, stars: ["Musa Al-Taamari", "Yazan Al-Naimat", "Ali Olwan"], history: "Surprise Asian Cup finalists ready to surprise." },
  // Group K
  por: { name: "Portugal", flag: "🇵🇹", rank: 6, stars: ["Cristiano Ronaldo", "Bruno Fernandes", "Rafael Leão"], history: "Superstar roster led by their record-breaking captain." },
  cod: { name: "DR Congo", flag: "🇨🇩", rank: 61, stars: ["Chancel Mbemba", "Yoane Wissa", "Meschack Elia"], history: "Direct side capable of tearing apart open defenses." },
  uzb: { name: "Uzbekistan", flag: "🇺🇿", rank: 64, stars: ["Eldor Shomurodov", "Abbosbek Fayzullaev", "Oston Urunov"], history: "Rising Asian stars featuring high-tempo organization." },
  col: { name: "Colombia", flag: "🇨🇴", rank: 12, stars: ["James Rodríguez", "Luis Díaz", "Jhon Durán"], history: "Playing spectacular high-flair South American football." },
  // Group L
  eng: { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", rank: 4, stars: ["Harry Kane", "Jude Bellingham", "Bukayo Saka"], history: "Desperate to bring football home with a superstar roster." },
  cro: { name: "Croatia", flag: "🇭🇷", rank: 10, stars: ["Luka Modrić", "Mateo Kovačić", "Joško Gvardiol"], history: "Midfield masters aiming for one last historic run." },
  gha: { name: "Ghana", flag: "🇬🇭", rank: 68, stars: ["Mohammed Kudus", "Inaki Williams", "Thomas Partey"], history: "Black Stars hoping to repeat their iconic 2010 run." },
  pan: { name: "Panama", flag: "🇵🇦", rank: 45, stars: ["Adalberto Carrasquilla", "Michael Amir Murillo", "José Fajardo"], history: "Resilient CONCACAF side with a disciplined low-block." }
};

const GROUPS_DATA = {
  A: ["mex", "rsa", "kor", "cze"],
  B: ["can", "bih", "qat", "sui"],
  C: ["bra", "mar", "hai", "sco"],
  D: ["usa", "par", "aus", "tur"],
  E: ["ger", "cuw", "civ", "ecu"],
  F: ["ned", "jpn", "swe", "tun"],
  G: ["bel", "egy", "irn", "nzl"],
  H: ["esp", "cpv", "ksa", "ury"],
  I: ["fra", "sen", "irq", "nor"],
  J: ["arg", "dza", "aut", "jor"],
  K: ["por", "cod", "uzb", "col"],
  L: ["eng", "cro", "gha", "pan"]
};

// Scheduler: Mapped identically to main app
const GROUP_STAGE_MATCHES = (() => {
  let md1 = [];
  let md2 = [];
  let md3 = [];

  Object.keys(GROUPS_DATA).forEach(g => {
    const teams = GROUPS_DATA[g];
    md1.push({ group: g, teamA: teams[0], teamB: teams[1], matchIndex: 0 });
    md1.push({ group: g, teamA: teams[2], teamB: teams[3], matchIndex: 1 });
    md2.push({ group: g, teamA: teams[0], teamB: teams[2], matchIndex: 2 });
    md2.push({ group: g, teamA: teams[1], teamB: teams[3], matchIndex: 3 });
    md3.push({ group: g, teamA: teams[3], teamB: teams[0], matchIndex: 4 });
    md3.push({ group: g, teamA: teams[1], teamB: teams[2], matchIndex: 5 });
  });

  return [...md1, ...md2, ...md3]; // Flat schedule of all 72 Group matches
})();

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
  anthropicKey: ""
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
  finishSilverName: document.getElementById("finish-silver-name"),
  finishBronzeName: document.getElementById("finish-bronze-name"),
  statTotalGoals: document.getElementById("stat-total-goals"),
  statAvgGoals: document.getElementById("stat-avg-goals"),
  quickUpsetMatch: document.getElementById("quick-upset-match"),
  
  btnShareResults: document.getElementById("btn-share-results"),
  btnGoToMainBracket: document.getElementById("btn-go-to-main-bracket"),
  btnRestartSwipe: document.getElementById("btn-restart-swipe")
};

// --- INITIALIZE & LOCAL STORAGE PERSISTENCE ---
function initDefaultState() {
  state.wizardStep = "welcome";
  state.userName = "";
  state.groupMatchScores = {};
  state.knockoutScores = {};
  state.knockoutPicks = {};
  state.thirdPlaceQualifiers = [];
  state.goalscorers = {};
  state.savedBrackets = [];
  
  for (const g of Object.keys(GROUPS_DATA)) {
    state.groupStandings[g] = [...GROUPS_DATA[g]];
  }
  historyStack.length = 0; // Clear history
  refreshActiveMatchCache();
}

function saveToLocalStorage() {
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
      state.anthropicKey = data.anthropicKey || localStorage.getItem("anthropic_key") || "";
      
      // CRITICAL SAFETY SHIELD: Ensure standings arrays exist and have elements to prevent resolution crashes
      for (const g of Object.keys(GROUPS_DATA)) {
        if (!state.groupStandings[g] || state.groupStandings[g].length < 4) {
          state.groupStandings[g] = [...GROUPS_DATA[g]];
        }
      }
      return true;
    } catch (e) {
      console.error("Local storage load error:", e);
    }
  }
  return false;
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
  Object.keys(GROUPS_DATA).forEach(gLetter => {
    const teams = GROUPS_DATA[gLetter];
    const stats = {};
    teams.forEach(t => {
      stats[t] = { teamId: t, pts: 0, gd: 0, gf: 0, ga: 0, w: 0, d: 0, l: 0 };
    });

    GROUP_STAGE_MATCHES.forEach(m => {
      if (m.group === gLetter) {
        const key = `${gLetter}_${m.matchIndex}`;
        const score = state.groupMatchScores[key];
        if (score && score.scoreA !== "" && score.scoreB !== "") {
          const sA = parseInt(score.scoreA);
          const sB = parseInt(score.scoreB);
          
          stats[m.teamA].gf += sA;
          stats[m.teamA].ga += sB;
          stats[m.teamA].gd += (sA - sB);
          
          stats[m.teamB].gf += sB;
          stats[m.teamB].ga += sA;
          stats[m.teamB].gd += (sB - sA);

          if (sA > sB) {
            stats[m.teamA].pts += 3;
            stats[m.teamA].w++;
            stats[m.teamB].l++;
          } else if (sB > sA) {
            stats[m.teamB].pts += 3;
            stats[m.teamB].w++;
            stats[m.teamA].l++;
          } else {
            stats[m.teamA].pts += 1;
            stats[m.teamB].pts += 1;
            stats[m.teamA].d++;
            stats[m.teamB].d++;
          }
        }
      }
    });

    const sorted = Object.values(stats).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return TEAMS_DB[a.teamId].rank - TEAMS_DB[b.teamId].rank; // Rank tiebreaker
    });

    state.groupStandings[gLetter] = sorted.map(s => s.teamId);
  });

  calculateTop8Wildcards();
}

function calculateThirdPlacedList() {
  const thirdsList = [];
  
  Object.keys(GROUPS_DATA).forEach(gLetter => {
    const thirdTeamId = state.groupStandings[gLetter][2]; // 3rd placed team
    const stats = { teamId: thirdTeamId, pts: 0, gd: 0, gf: 0, ga: 0, w: 0, d: 0, l: 0 };
    
    GROUP_STAGE_MATCHES.forEach(m => {
      if (m.group === gLetter && (m.teamA === thirdTeamId || m.teamB === thirdTeamId)) {
        const key = `${gLetter}_${m.matchIndex}`;
        const score = state.groupMatchScores[key];
        if (score && score.scoreA !== "" && score.scoreB !== "") {
          const sA = parseInt(score.scoreA);
          const sB = parseInt(score.scoreB);
          const isA = (m.teamA === thirdTeamId);
          const myScore = isA ? sA : sB;
          const oppScore = isA ? sB : sA;
          
          stats.gf += myScore;
          stats.ga += oppScore;
          stats.gd += (myScore - oppScore);
          
          if (myScore > oppScore) {
            stats.w++;
            stats.pts += 3;
          } else if (oppScore > myScore) {
            stats.l++;
          } else {
            stats.d++;
            stats.pts += 1;
          }
        }
      }
    });
    thirdsList.push(stats);
  });

  thirdsList.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return TEAMS_DB[a.teamId].rank - TEAMS_DB[b.teamId].rank;
  });

  return thirdsList;
}

function calculateTop8Wildcards() {
  const list = calculateThirdPlacedList();
  state.thirdPlaceQualifiers = list.slice(0, 8).map(l => l.teamId);
}

// --- 5. PROGRESS & CURRENT MATCH COORDINATOR ---
// Counts completed matches in predictions state to find active matchup
function getActiveMatchIndex() {
  // A. Group matches
  for (let i = 0; i < 72; i++) {
    const key = `${GROUP_STAGE_MATCHES[i].group}_${GROUP_STAGE_MATCHES[i].matchIndex}`;
    const score = state.groupMatchScores[key];
    if (!score || score.scoreA === "" || score.scoreB === "") {
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
  
  // rotation proportional to delta X
  const rotation = dX * 0.08;
  cardEl.style.transform = `translate(${dX}px, ${dY}px) rotate(${rotation}deg)`;
  
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

function dragEnd(e) {
  if (!isDragging || !cardEl || !cachedActiveMatch) return;
  
  isDragging = false;
  cardEl.classList.remove("dragging");
  
  document.removeEventListener("mousemove", dragMove);
  document.removeEventListener("touchmove", dragMove);
  document.removeEventListener("mouseup", dragEnd);
  document.removeEventListener("touchend", dragEnd);
  
  const currentTransform = cardEl.style.transform;
  const match = currentTransform.match(/translate\(([-0-9.]+)px,\s*([-0-9.]+)px\)/);
  
  let dX = 0;
  let dY = 0;
  
  if (match) {
    dX = parseFloat(match[1]);
    dY = parseFloat(match[2]);
  }
  
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
    cardEl.style.transform = "translate(0, 0) rotate(0deg)";
    
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
      state.groupMatchScores[key] = { scoreA: "2", scoreB: "1" };
      showToast(`${teamA.flag} ${teamA.name} Wins!`);
      animateSwipeExit(card, "win-a", () => proceedNextMatch());
    } else if (direction === "win-b") {
      state.groupMatchScores[key] = { scoreA: "1", scoreB: "2" };
      showToast(`${teamB.flag} ${teamB.name} Wins!`);
      animateSwipeExit(card, "win-b", () => proceedNextMatch());
    } else if (direction === "draw") {
      state.groupMatchScores[key] = { scoreA: "1", scoreB: "1" };
      showToast("🤝 Match Drawn!");
      animateSwipeExit(card, "draw", () => proceedNextMatch());
    }
  } else if (cachedActiveMatch.stage === "knockouts") {
    const mId = cachedActiveMatch.matchId;
    const matchInfo = KNOCKOUT_MATCHES[mId].resolve();
    const teamA = TEAMS_DB[matchInfo.a];
    const teamB = TEAMS_DB[matchInfo.b];
    
    if (direction === "win-a") {
      state.knockoutScores[mId] = { scoreA: "2", scoreB: "1", pWinner: matchInfo.a };
      state.knockoutPicks[mId] = matchInfo.a;
      showToast(`${teamA.flag} ${teamA.name} Wins!`);
      animateSwipeExit(card, "win-a", () => proceedNextMatch());
    } else if (direction === "win-b") {
      state.knockoutScores[mId] = { scoreA: "1", scoreB: "2", pWinner: matchInfo.b };
      state.knockoutPicks[mId] = matchInfo.b;
      showToast(`${teamB.flag} ${teamB.name} Wins!`);
      animateSwipeExit(card, "win-b", () => proceedNextMatch());
    } else if (direction === "draw") {
      // Knockout draws cannot happen! Bounce back and alert.
      showToast("Draws not allowed in Knockout matches!", true);
      historyStack.pop(); // Clear pushed snapshot since it bounced
      if (card) {
        card.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.25)";
        card.style.transform = "translate(0, 0) rotate(0deg)";
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
      let scoreA, scoreB;
      if (r < pA) {
        // A wins: Score 2-1 (60%), 1-0 (25%), or 2-0 (15%)
        const randScore = Math.random();
        if (randScore < 0.60) { scoreA = 2; scoreB = 1; }
        else if (randScore < 0.85) { scoreA = 1; scoreB = 0; }
        else { scoreA = 2; scoreB = 0; }
      } else if (r < pA + pDraw) {
        // Draw: Score 1-1 (60%), 0-0 (25%), or 2-2 (15%)
        const randScore = Math.random();
        if (randScore < 0.60) { scoreA = 1; scoreB = 1; }
        else if (randScore < 0.85) { scoreA = 0; scoreB = 0; }
        else { scoreA = 2; scoreB = 2; }
      } else {
        // B wins: Score 1-2 (60%), 0-1 (25%), or 0-2 (15%)
        const randScore = Math.random();
        if (randScore < 0.60) { scoreA = 1; scoreB = 2; }
        else if (randScore < 0.85) { scoreA = 0; scoreB = 1; }
        else { scoreA = 0; scoreB = 2; }
      }

      state.groupMatchScores[key] = { scoreA: String(scoreA), scoreB: String(scoreB) };
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
      let scoreA, scoreB, pick;
      if (r < pA) {
        // A wins: Score 2-1 (70%) or 1-0 (30%)
        const randScore = Math.random();
        scoreA = randScore < 0.70 ? 2 : 1;
        scoreB = scoreA === 2 ? 1 : 0;
        pick = teamAId;
      } else {
        // B wins: Score 1-2 (70%) or 0-1 (30%)
        const randScore = Math.random();
        scoreB = randScore < 0.70 ? 2 : 1;
        scoreA = scoreB === 2 ? 1 : 0;
        pick = teamBId;
      }

      state.knockoutScores[mId] = { scoreA: String(scoreA), scoreB: String(scoreB), pWinner: pick };
      state.knockoutPicks[mId] = pick;
      simulatedCount++;
    }
  }

  // Recalculate standings, update local storage, refresh cache & render
  recalculateStandings();
  saveToLocalStorage();
  refreshActiveMatchCache();
  renderActiveCardDeck();

  showToast(`⚡ ${stageLabel} simulated based on ELO!`);
}

// --- 7.6. PERSONALIZATION HELPERS ---
function updateHeaderTitle() {
  if (!DOM.appHeaderTitle) return;
  if (state.userName) {
    const name = state.userName;
    const title = name.endsWith("s") ? `${name}'` : `${name}'s`;
    DOM.appHeaderTitle.innerText = `${title} Prediction`;
  } else {
    DOM.appHeaderTitle.innerText = "World Cup 2026 Prediction";
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
    updateHeaderTitle();
    return;
  } else {
    if (DOM.paneSwipeWelcome) DOM.paneSwipeWelcome.classList.add("hidden");
  }
  
  // B. Check if completed simulation!
  if (cachedActiveMatch.stage === "completed") {
    revealPodiumChampionship();
    return;
  }

  // Switch screen view if panel was in podium or welcome
  DOM.paneSwipeDeck.classList.remove("hidden");
  DOM.paneSwipePodium.classList.add("hidden");

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
      <div class="swipe-stamp stamp-win-a">${teamA.flag} WIN A</div>
      <div class="swipe-stamp stamp-win-b">WIN B ${teamB.flag}</div>
      <div class="swipe-stamp stamp-draw">🤝 DRAW</div>

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
        <span>History & Stars Spotlight</span>
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
          <p>Knockout slot resolving error. Try resetting the stage predictions.</p>
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

// --- 10. CHAMPIONSHIP REVEAL & CTA ---
function revealPodiumChampionship() {
  if (DOM.paneSwipeWelcome) DOM.paneSwipeWelcome.classList.add("hidden");
  DOM.paneSwipeDeck.classList.add("hidden");
  DOM.paneSwipePodium.classList.remove("hidden");
  
  // Set championship step for shared compatibility
  state.wizardStep = "championship";
  saveToLocalStorage();
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
  if (runner) DOM.finishSilverName.innerText = runner.name;
  if (third) DOM.finishBronzeName.innerText = third.name;

  // Compile quick statistics
  let totalGoals = 0;
  // A. Groups goals
  Object.values(state.groupMatchScores).forEach(score => {
    if (score && score.scoreA !== "" && score.scoreB !== "") {
      totalGoals += (parseInt(score.scoreA) + parseInt(score.scoreB));
    }
  });
  // B. Knockouts goals
  Object.values(state.knockoutScores).forEach(score => {
    if (score && score.scoreA !== "" && score.scoreB !== "") {
      totalGoals += (parseInt(score.scoreA) + parseInt(score.scoreB));
    }
  });

  DOM.statTotalGoals.innerText = totalGoals;
  DOM.statAvgGoals.innerText = (totalGoals / 104).toFixed(2);

  // Biggest Upset Finder
  let biggestDiff = -1;
  let upsetText = "No clear upsets found";

  // Scan group stage matches
  GROUP_STAGE_MATCHES.forEach(m => {
    const key = `${m.group}_${m.matchIndex}`;
    const score = state.groupMatchScores[key];
    if (score && score.scoreA !== "" && score.scoreB !== "") {
      const sA = parseInt(score.scoreA);
      const sB = parseInt(score.scoreB);
      const rA = TEAMS_DB[m.teamA].rank;
      const rB = TEAMS_DB[m.teamB].rank;

      if (sA > sB && rA > rB) { // Lower-ranked (higher rank number) A beat B
        const diff = rA - rB;
        if (diff > biggestDiff) {
          biggestDiff = diff;
          upsetText = `${TEAMS_DB[m.teamA].flag} ${TEAMS_DB[m.teamA].name} beat ${TEAMS_DB[m.teamB].name} (${sA}-${sB})`;
        }
      } else if (sB > sA && rB > rA) { // Lower-ranked B beat A
        const diff = rB - rA;
        if (diff > biggestDiff) {
          biggestDiff = diff;
          upsetText = `${TEAMS_DB[m.teamB].flag} ${TEAMS_DB[m.teamB].name} beat ${TEAMS_DB[m.teamA].name} (${sA}-${sB})`;
        }
      }
    }
  });

  // Scan knockout matches
  for (let mId = 73; mId <= 104; mId++) {
    const score = state.knockoutScores[mId];
    const pick = state.knockoutPicks[mId];
    const resolved = KNOCKOUT_MATCHES[mId].resolve();
    if (score && pick && resolved.a && resolved.b) {
      const isWinnerA = (pick === resolved.a);
      const winner = isWinnerA ? resolved.a : resolved.b;
      const loser = isWinnerA ? resolved.b : resolved.a;
      
      const rWin = TEAMS_DB[winner].rank;
      const rLose = TEAMS_DB[loser].rank;
      if (rWin > rLose) { // Upset!
        const diff = rWin - rLose;
        if (diff > biggestDiff) {
          biggestDiff = diff;
          upsetText = `${TEAMS_DB[winner].flag} ${TEAMS_DB[winner].name} beat ${TEAMS_DB[loser].name} (${score.scoreA}-${score.scoreB})`;
        }
      }
    }
  }

  DOM.quickUpsetMatch.innerText = upsetText;

  // Customizations for Share/Viewer Mode
  if (state.isViewer) {
    if (DOM.btnRestartSwipe) {
      DOM.btnRestartSwipe.innerHTML = `<i class="fa-solid fa-play"></i> Make Your Own Prediction`;
      DOM.btnRestartSwipe.className = "btn btn-gold btn-lg btn-block pulse-gold";
      DOM.btnRestartSwipe.style.padding = "14px";
      DOM.btnRestartSwipe.style.fontWeight = "700";
    }
    // Hide controls that are irrelevant to read-only viewers
    if (DOM.btnUndo) DOM.btnUndo.classList.add("hidden");
    if (DOM.btnReset) DOM.btnReset.classList.add("hidden");
    if (DOM.btnGoToMainBracket) DOM.btnGoToMainBracket.classList.add("hidden");
  } else {
    if (DOM.btnRestartSwipe) {
      DOM.btnRestartSwipe.innerHTML = `<i class="fa-solid fa-rotate-left"></i> Swipe New Bracket`;
      DOM.btnRestartSwipe.className = "btn btn-secondary btn-sm";
      DOM.btnRestartSwipe.style.padding = "";
      DOM.btnRestartSwipe.style.fontWeight = "";
    }
    if (DOM.btnUndo) DOM.btnUndo.classList.remove("hidden");
    if (DOM.btnReset) DOM.btnReset.classList.remove("hidden");
    if (DOM.btnGoToMainBracket) DOM.btnGoToMainBracket.classList.remove("hidden");
  }
}

// --- 11. EVENT REGISTRATION DOMCONTENTLOADED ---
window.addEventListener("DOMContentLoaded", () => {
  // Check if viewing a shared bracket via URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const shareParam = urlParams.get("share");
  
  if (shareParam) {
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(shareParam))));
      state.userName = decoded.name;
      state.knockoutPicks = decoded.picks;
      state.wizardStep = "championship";
      state.isViewer = true; // Read-only mode flag
      recalculateStandings();
    } catch (err) {
      console.error("Failed to parse shared prediction data:", err);
      showToast("Invalid shared link", true);
    }
  } else {
    // Load state or start new simulation
    const loaded = loadFromLocalStorage();
    if (!loaded) {
      initDefaultState();
      saveToLocalStorage();
    } else {
      // If name is empty, force them to welcome but DO NOT wipe predictions!
      if (!state.userName) {
        state.wizardStep = "welcome";
      }
      recalculateStandings();
    }
  }

  // Refresh active match cache before rendering first card
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
      saveToLocalStorage();
      refreshActiveMatchCache();
      renderActiveCardDeck();
      showToast("Predictor fully reset!");
    }
  });

  DOM.btnRestartSwipe.addEventListener("click", () => {
    if (state.isViewer) {
      // Go to clean page (strip parameters) to predict their own bracket
      window.location.href = window.location.pathname;
      return;
    }
    initDefaultState();
    saveToLocalStorage();
    refreshActiveMatchCache();
    renderActiveCardDeck();
  });

  DOM.btnGoToMainBracket.addEventListener("click", () => {
    // Re-evaluate main standings compatibility
    recalculateStandings();
    state.wizardStep = "championship";
    saveToLocalStorage();
    
    showToast("Transferring to main dashboard...");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 800);
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
      saveToLocalStorage();
      updateHeaderTitle();
      renderActiveCardDeck();
      showToast(`Welcome, ${nameVal}!`);
    });
  }

  if (DOM.inputUserName) {
    DOM.inputUserName.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (DOM.btnStartPrediction) DOM.btnStartPrediction.click();
      }
    });
  }

  // Share Results CTR
  if (DOM.btnShareResults) {
    DOM.btnShareResults.addEventListener("click", async () => {
      const name = state.userName || "My";
      const title = name.endsWith("s") ? `${name}'` : `${name}'s`;
      
      const champId = state.knockoutPicks[104];
      const runnerId = champId === KNOCKOUT_MATCHES[104].resolve().a ? KNOCKOUT_MATCHES[104].resolve().b : KNOCKOUT_MATCHES[104].resolve().a;
      const thirdId = state.knockoutPicks[103];

      const champ = TEAMS_DB[champId];
      const runner = TEAMS_DB[runnerId];
      const third = TEAMS_DB[thirdId];

      // Serialize prediction data to base64 for static serverless URL sharing
      let shareUrl = "https://itaykt.github.io/world-cup-predictor/swipe.html";
      try {
        const serialized = btoa(unescape(encodeURIComponent(JSON.stringify({
          name: state.userName,
          picks: state.knockoutPicks
        }))));
        shareUrl = `${window.location.origin}${window.location.pathname}?share=${serialized}`;
      } catch (err) {
        console.error("Failed to generate share URL:", err);
      }

      let text = `🏆 ${title} World Cup 2026 Prediction 🏆\n\n`;
      if (champ) text += `🥇 CHAMPION: ${champ.flag} ${champ.name.toUpperCase()}\n`;
      if (runner) text += `🥈 RUNNER-UP: ${runner.flag} ${runner.name}\n`;
      if (third) text += `🥉 THIRD PLACE: ${third.flag} ${third.name}\n\n`;

      // Semi-finalists (picks from 101, 102)
      const sfTeams = [101, 102].map(mId => {
        const wId = state.knockoutPicks[mId];
        return wId ? `${TEAMS_DB[wId].flag} ${TEAMS_DB[wId].name}` : "";
      }).filter(Boolean);
      if (sfTeams.length > 0) {
        text += `🔥 SEMI-FINALISTS:\n• ${sfTeams.join('\n• ')}\n\n`;
      }

      // Quarter-finalists (picks from 97, 98, 99, 100)
      const qfTeams = [97, 98, 99, 100].map(mId => {
        const wId = state.knockoutPicks[mId];
        return wId ? `${TEAMS_DB[wId].flag} ${TEAMS_DB[wId].name}` : "";
      }).filter(Boolean);
      if (qfTeams.length > 0) {
        text += `⚡ QUARTER-FINALISTS:\n• ${qfTeams.join('\n• ')}\n\n`;
      }

      text += `Simulated on Swipe Cup ⚽ Predict yours at: ${shareUrl}`;

      const shareData = {
        title: `${title} World Cup Prediction`,
        text: text,
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

      // Clipboard fallback
      try {
        await navigator.clipboard.writeText(text);
        showToast("📋 Results rundown copied to clipboard!");
      } catch (err) {
        console.error("Clipboard copy failed:", err);
        showToast("Clipboard copy failed. Please copy manually.", true);
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
