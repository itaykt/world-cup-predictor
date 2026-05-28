/**
 * World Cup 2026 teams, groups, and group-stage schedule (single source of truth).
 */
(function (root, factory) {
  const data = factory();
  root.TournamentData = data;
  if (typeof module === "object" && module.exports) {
    module.exports = data;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : this, function () {
  const TEAMS_DB = {
  // Group A
  mex: { name: "Mexico", flag: "🇲🇽", rank: 15, stars: ["Santiago Giménez", "Edson Álvarez", "Luis Chávez"], history: "Co-hosts seeking to break the fifth-game curse on home soil." },
  rsa: { name: "South Africa", flag: "🇿🇦", rank: 59, stars: ["Percy Tau", "Teboho Mokoena", "Lyle Foster"], history: "Bafana Bafana returning to capture the magic spirit of 2010." },
  kor: { name: "South Korea", flag: "🇰🇷", rank: 22, stars: ["Son Heung-min", "Kim Min-jae", "Lee Kang-in"], history: "Taegeuk Warriors looking to replicate their legendary 2002 semi-final run." },
  cze: { name: "Czechia", flag: "🇨🇿", rank: 40, stars: ["Patrik Schick", "Tomáš Souček", "Adam Hložek"], history: "Tactically rigid European side looking to surprise global giants." },
  // Group B
  can: { name: "Canada", flag: "🇨🇦", rank: 48, stars: ["Alphonso Davies", "Jonathan David", "Tajon Buchanan"], history: "Co-hosts seeking their first-ever World Cup knockout stage appearance." },
  bih: { name: "Bosnia & Herz.", flag: "🇧🇦", rank: 74, stars: ["Edin Džeko", "Miralem Pjanić", "Sead Kolašinac"], history: "Golden generation veterans aiming for a final major tournament highlight." },
  qat: { name: "Qatar", flag: "🇶🇦", rank: 37, stars: ["Akram Afif", "Almoez Ali", "Boualem Khoukhi"], history: "Recent Asian Cup champions hoping to prove their mettle on the global stage." },
  sui: { name: "Switzerland", flag: "🇨🇭", rank: 19, stars: ["Granit Xhaka", "Manuel Akanji", "Breel Embolo"], history: "Knockout-stage regulars famous for their giant-killing capabilities." },
  // Group C
  bra: { name: "Brazil", flag: "🇧🇷", rank: 5, stars: ["Vinícius Júnior", "Rodrygo", "Neymar Jr"], history: "Five-time champions hunting relentlessly for their elusive sixth star." },
  mar: { name: "Morocco", flag: "🇲🇦", rank: 13, stars: ["Achraf Hakimi", "Yassine Bounou", "Sofyan Amrabat"], history: "Historic 2022 semi-finalists proving they belong to the world's football elite." },
  hai: { name: "Haiti", flag: "🇭🇹", rank: 86, stars: ["Frantzdy Pierrot", "Duckens Nazon", "Derrick Etienne"], history: "Caribbean underdogs looking to create monumental group-stage upsets." },
  sco: { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", rank: 36, stars: ["Scott McTominay", "John McGinn", "Andrew Robertson"], history: "Passionate squad aiming for their historic first-ever group stage progression." },
  // Group D
  usa: { name: "United States", flag: "🇺🇸", rank: 11, stars: ["Christian Pulisic", "Weston McKennie", "Folarin Balogun"], history: "Co-hosts with a talented, highly athletic young core primed for a deep run." },
  par: { name: "Paraguay", flag: "🇵🇾", rank: 56, stars: ["Miguel Almirón", "Julio Enciso", "Gustavo Gómez"], history: "Resilient South American side anchored by defensive grit and counter-attacks." },
  aus: { name: "Australia", flag: "🇦🇺", rank: 23, stars: ["Mathew Ryan", "Craig Goodwin", "Jackson Irvine"], history: "Socceroos hoping to build on their impressive 2022 round of 16 run." },
  tur: { name: "Türkiye", flag: "🇹🇷", rank: 26, stars: ["Hakan Çalhanoğlu", "Arda Güler", "Kenan Yıldız"], history: "Exciting young generation dreaming of repeating their 2002 bronze medal run." },
  // Group E
  ger: { name: "Germany", flag: "🇩🇪", rank: 16, stars: ["Florian Wirtz", "Jamal Musiala", "Kai Havertz"], history: "Four-time champions rebuilding with world-class young playmakers." },
  cuw: { name: "Curaçao", flag: "🇨🇼", rank: 91, stars: ["Juninho Bacuna", "Leandro Bacuna", "Rangelo Janga"], history: "Caribbean islanders seeking to make their first splash on the big stage." },
  civ: { name: "Côte d'Ivoire", flag: "🇨🇮", rank: 38, stars: ["Sébastien Haller", "Franck Kessié", "Simon Adingra"], history: "Recent African champions possessing elite physical presence and speed." },
  ecu: { name: "Ecuador", flag: "🇪🇨", rank: 31, stars: ["Moisés Caicedo", "Piero Hincapié", "Enner Valencia"], history: "Fearless Andean side with high altitude pace and defensive resilience." },
  // Group F
  ned: { name: "Netherlands", flag: "🇳🇱", rank: 7, stars: ["Virgil van Dijk", "Cody Gakpo", "Frenkie de Jong"], history: "Oranje seeking to break their three-time finalist bridesmaid curse." },
  jpn: { name: "Japan", flag: "🇯🇵", rank: 18, stars: ["Kaoru Mitoma", "Takefusa Kubo", "Wataru Endo"], history: "Samurai Blue boasting high-octane pressing and tactical precision." },
  swe: { name: "Sweden", flag: "🇸🇪", rank: 28, stars: ["Alexander Isak", "Dejan Kulusevski", "Viktor Gyökeres"], history: "High-flying Scandinavian attackers looking to power a deep knockout run." },
  tun: { name: "Tunisia", flag: "🇹🇳", rank: 41, stars: ["Aissa Laïdouni", "Ellyes Skhiri", "Youssef Msakni"], history: "Carthage Eagles famous for tactical discipline and defensive solidness." },
  // Group G
  bel: { name: "Belgium", flag: "🇧🇪", rank: 3, stars: ["Kevin De Bruyne", "Romelu Lukaku", "Jérémy Doku"], history: "Red Devils blending veteran geniuses with explosive young wingers." },
  egy: { name: "Egypt", flag: "🇪🇬", rank: 30, stars: ["Mohamed Salah", "Mostafa Mohamed", "Omar Marmoush"], history: "Pharaohs led by a legendary winger hungry for global glory." },
  irn: { name: "IR Iran", flag: "🇮🇷", rank: 20, stars: ["Mehdi Taremi", "Sardar Azmoun", "Alireza Jahanbakhsh"], history: "Asian powerhouse featuring a lethal strike partnership." },
  nzl: { name: "New Zealand", flag: "🇳🇿", rank: 104, stars: ["Chris Wood", "Liberato Cacace", "Sarpreet Singh"], history: "OFC champions aiming to remain undefeated just like in South Africa 2010." },
  // Group H
  esp: { name: "Spain", flag: "🇪🇸", rank: 8, stars: ["Lamine Yamal", "Rodri", "Nico Williams"], history: "European champions playing breathtaking, possession-based modern football." },
  cpv: { name: "Cabo Verde", flag: "🇨🇻", rank: 65, stars: ["Ryan Mendes", "Garry Rodrigues", "Bebé"], history: "Blue Sharks seeking to continue their giant-killing African Cup form." },
  ksa: { name: "Saudi Arabia", flag: "🇸🇦", rank: 53, stars: ["Salem Al-Dawsari", "Firas Al-Buraikan", "Abdulrahman Ghareeb"], history: "Remembered for upsetting Argentina in 2022; highly organized squad." },
  ury: { name: "Uruguay", flag: "🇺🇾", rank: 14, stars: ["Federico Valverde", "Darwin Núñez", "Luis Suárez"], history: "Two-time winners featuring relentless high-press and legendary grit." },
  // Group I
  fra: { name: "France", flag: "🇫🇷", rank: 2, stars: ["Kylian Mbappé", "Antoine Griezmann", "William Saliba"], history: "Pre-tournament favorites loaded with world-class squad depth and speed." },
  sen: { name: "Senegal", flag: "🇸🇳", rank: 17, stars: ["Sadio Mané", "Nicolas Jackson", "Kalidou Koulibaly"], history: "Lions of Teranga looking to make Africa proud with elite talent." },
  irq: { name: "Iraq", flag: "🇮🇶", rank: 58, stars: ["Aymen Hussein", "Ali Jasim", "Zidane Iqbal"], history: "Lions of Mesopotamia returning with fierce passion and dangerous attackers." },
  nor: { name: "Norway", flag: "🇳🇴", rank: 47, stars: ["Erling Haaland", "Martin Ødegaard", "Oscar Bobb"], history: "Boasting the world's most lethal striker and an elite midfield orchestrator." },
  // Group J
  arg: { name: "Argentina", flag: "🇦🇷", rank: 1, stars: ["Lionel Messi", "Lautaro Martínez", "Julián Álvarez"], history: "Defending champions seeking to give their legendary captain a perfect farewell." },
  dza: { name: "Algeria", flag: "🇩🇿", rank: 43, stars: ["Riyad Mahrez", "Saïd Benrahma", "Amine Gouiri"], history: "Desert Foxes possessing incredible individual technical brilliance." },
  aut: { name: "Austria", flag: "🇦🇹", rank: 25, stars: ["Marcel Sabitzer", "Konrad Laimer", "Christoph Baumgartner"], history: "Intense high-pressing machine engineered for physical dominance." },
  jor: { name: "Jordan", flag: "🇯🇴", rank: 71, stars: ["Musa Al-Taamari", "Yazan Al-Naimat", "Ali Olwan"], history: "Surprise Asian Cup finalists ready to announce themselves to the world." },
  // Group K
  por: { name: "Portugal", flag: "🇵🇹", rank: 6, stars: ["Cristiano Ronaldo", "Bruno Fernandes", "Rafael Leão"], history: "Squad of extraordinary depth led by their record-breaking veteran captain." },
  cod: { name: "DR Congo", flag: "🇨🇩", rank: 61, stars: ["Chancel Mbemba", "Yoane Wissa", "Meschack Elia"], history: "Physical and direct side capable of tearing apart open defenses on the counter." },
  uzb: { name: "Uzbekistan", flag: "🇺🇿", rank: 64, stars: ["Eldor Shomurodov", "Abbosbek Fayzullaev", "Oston Urunov"], history: "Rising Asian stars featuring high-tempo organization and technical skills." },
  col: { name: "Colombia", flag: "🇨🇴", rank: 12, stars: ["James Rodríguez", "Luis Díaz", "Jhon Durán"], history: "South American powerhouse playing spectacular, high-flair football." },
  // Group L
  eng: { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", rank: 4, stars: ["Harry Kane", "Jude Bellingham", "Bukayo Saka"], history: "Three Lions desperate to bring football home with a superstar roster." },
  cro: { name: "Croatia", flag: "🇭🇷", rank: 10, stars: ["Luka Modrić", "Mateo Kovačić", "Joško Gvardiol"], history: "Legendary midfield masters aiming for one last historic tournament run." },
  gha: { name: "Ghana", flag: "🇬🇭", rank: 68, stars: ["Mohammed Kudus", "Inaki Williams", "Thomas Partey"], history: "Black Stars hoping to repeat their iconic, dramatic 2010 quarter-final run." },
  pan: { name: "Panama", flag: "🇵🇦", rank: 45, stars: ["Adalberto Carrasquilla", "Michael Amir Murillo", "José Fajardo"], history: "Resilient CONCACAF side known for highly disciplined low-block setups." }
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

  const md1 = [];
  const md2 = [];
  const md3 = [];

  Object.keys(GROUPS_DATA).forEach((g) => {
    const teams = GROUPS_DATA[g];
    md1.push({ group: g, teamA: teams[0], teamB: teams[1], matchIndex: 0 });
    md1.push({ group: g, teamA: teams[2], teamB: teams[3], matchIndex: 1 });
    md2.push({ group: g, teamA: teams[0], teamB: teams[2], matchIndex: 2 });
    md2.push({ group: g, teamA: teams[1], teamB: teams[3], matchIndex: 3 });
    md3.push({ group: g, teamA: teams[3], teamB: teams[0], matchIndex: 4 });
    md3.push({ group: g, teamA: teams[1], teamB: teams[2], matchIndex: 5 });
  });

  const GROUP_STAGE_MATCHES_BY_MD = { md1, md2, md3 };
  const GROUP_STAGE_MATCHES_FLAT = [...md1, ...md2, ...md3];

  return {
    TEAMS_DB,
    GROUPS_DATA,
    GROUP_STAGE_MATCHES_BY_MD,
    GROUP_STAGE_MATCHES_FLAT
  };
});
