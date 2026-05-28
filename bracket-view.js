/**
 * Read-only bracket viewer: knockout tree + group stage tables.
 */
(function (root, factory) {
  const BracketView = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = BracketView;
  } else {
    root.BracketView = BracketView;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : this, function () {
  const BRACKET_LAYOUT = {
    r32Left: [73, 75, 74, 77, 76, 78, 79, 80],
    r32Right: [81, 82, 83, 84, 85, 87, 86, 88],
    r16Left: [90, 89, 91, 92],
    r16Right: [94, 93, 96, 95],
    qfLeft: [97, 99],
    qfRight: [98, 100],
    sfLeft: [101],
    sfRight: [102]
  };

  function teamLabel(teamsDb, teamId, fallback) {
    if (!teamId || !teamsDb[teamId]) return fallback || "TBD";
    const t = teamsDb[teamId];
    return `${t.flag} ${t.name}`;
  }

  function normalizeGroupOutcome(entry) {
    const TS = typeof globalThis !== "undefined" ? globalThis.TournamentStandings : null;
    if (TS && TS.normalizeGroupOutcome) {
      return TS.normalizeGroupOutcome(entry);
    }
    if (!entry || entry.scoreA === "" || entry.scoreB === "") return null;
    if (entry.outcome === "a" || entry.outcome === "b" || entry.outcome === "d") return entry.outcome;
    const sA = parseInt(entry.scoreA, 10);
    const sB = parseInt(entry.scoreB, 10);
    if (sA > sB) return "a";
    if (sB > sA) return "b";
    return "d";
  }

  function formatGroupResult(entry, teamAId, teamBId, teamsDb) {
    const outcome = normalizeGroupOutcome(entry);
    if (!outcome) return "";
    const a = teamsDb[teamAId];
    const b = teamsDb[teamBId];
    if (!a || !b) return "";
    if (outcome === "d") return "Draw";
    if (outcome === "a") return `${a.flag} ${a.name} win`;
    return `${b.flag} ${b.name} win`;
  }

  function formatKnockoutResult(winnerId, teamsDb) {
    if (!winnerId || !teamsDb[winnerId]) return "";
    const t = teamsDb[winnerId];
    return `${t.flag} advances`;
  }

  function buildMatchCard(mId, options) {
    const { teamsDb, knockoutPicks, resolveMatch } = options;
    const resolved = resolveMatch(mId) || {};
    const teamA = resolved.a || resolved.teamA;
    const teamB = resolved.b || resolved.teamB;
    const winnerId = knockoutPicks[mId];
    const scoreText = formatKnockoutResult(winnerId, teamsDb);

    const card = document.createElement("div");
    card.className = "bv-match-card glass-panel";
    card.dataset.matchId = String(mId);

    const meta = document.createElement("div");
    meta.className = "bv-match-meta";
    meta.innerHTML = `<span>M${mId}</span>${scoreText ? `<span class="bv-score-pill">${scoreText}</span>` : ""}`;
    card.appendChild(meta);

    [teamA, teamB].forEach((tid) => {
      const slot = document.createElement("div");
      slot.className = "bv-slot" + (winnerId && tid && winnerId === tid ? " bv-slot-winner" : "");
      const flag = tid && teamsDb[tid] ? teamsDb[tid].flag : "🏳️";
      const name = tid && teamsDb[tid] ? teamsDb[tid].name : "TBD";
      slot.innerHTML = `<span class="bv-slot-flag">${flag}</span><span class="bv-slot-name">${name}</span>`;
      card.appendChild(slot);
    });

    return card;
  }

  function fillColumn(colEl, matchIds, options) {
    const list = document.createElement("div");
    list.className = "bv-match-list";
    matchIds.forEach((mId) => list.appendChild(buildMatchCard(mId, options)));
    colEl.appendChild(list);
  }

  function buildCenterFinal(options) {
    const { teamsDb, knockoutPicks, resolveMatch } = options;
    const wrap = document.createElement("div");
    wrap.className = "bv-center-podium";

    const thirdBox = document.createElement("div");
    thirdBox.className = "bv-finals-box glass-panel";
    thirdBox.innerHTML = '<div class="bv-finals-label"><i class="fa-solid fa-medal"></i> 3rd place</div>';
    const thirdResolved = resolveMatch(103) || {};
    const tA = thirdResolved.a || thirdResolved.teamA;
    const tB = thirdResolved.b || thirdResolved.teamB;
    const tWin = knockoutPicks[103];
    const tScore = formatKnockoutResult(tWin, teamsDb);
    thirdBox.appendChild(buildMiniFinalPair(teamsDb, tA, tB, tWin, tScore));
    wrap.appendChild(thirdBox);

    const finalBox = document.createElement("div");
    finalBox.className = "bv-finals-box glass-panel bv-finals-main";
    finalBox.innerHTML = '<div class="bv-finals-label"><i class="fa-solid fa-crown"></i> Final</div>';
    const fResolved = resolveMatch(104) || {};
    const fA = fResolved.a || fResolved.teamA;
    const fB = fResolved.b || fResolved.teamB;
    const fWin = knockoutPicks[104];
    const fScore = formatKnockoutResult(fWin, teamsDb);
    finalBox.appendChild(buildMiniFinalPair(teamsDb, fA, fB, fWin, fScore, true));
    wrap.appendChild(finalBox);

    return wrap;
  }

  function buildMiniFinalPair(teamsDb, teamA, teamB, winnerId, scoreText, isFinal) {
    const row = document.createElement("div");
    row.className = "bv-finals-pair";
    if (scoreText) {
      const sc = document.createElement("div");
      sc.className = "bv-finals-score";
      sc.textContent = scoreText;
      row.appendChild(sc);
    }
    [teamA, teamB].forEach((tid) => {
      const slot = document.createElement("div");
      slot.className = "bv-slot" + (winnerId && tid && winnerId === tid ? " bv-slot-winner" : "");
      if (isFinal && winnerId && tid === winnerId) slot.classList.add("bv-champion-slot");
      const flag = tid && teamsDb[tid] ? teamsDb[tid].flag : "🏳️";
      const name = tid && teamsDb[tid] ? teamsDb[tid].name : "TBD";
      slot.innerHTML = `<span class="bv-slot-flag">${flag}</span><span class="bv-slot-name">${name}</span>`;
      row.appendChild(slot);
    });
    return row;
  }

  function renderKnockoutTree(container, options) {
    if (!container) return;
    container.innerHTML = "";

    const viewport = document.createElement("div");
    viewport.className = "bv-tree-viewport";
    const canvas = document.createElement("div");
    canvas.className = "bv-tree-canvas";

    function addColumn(title, matchIds, sideClass) {
      const col = document.createElement("div");
      col.className = `bv-tree-col ${sideClass || ""}`.trim();
      const h = document.createElement("div");
      h.className = "bv-col-title";
      h.textContent = title;
      col.appendChild(h);
      fillColumn(col, matchIds, options);
      canvas.appendChild(col);
      return col;
    }

    addColumn("Round of 32", BRACKET_LAYOUT.r32Left, "bv-col-left");
    addColumn("Round of 16", BRACKET_LAYOUT.r16Left, "bv-col-left");
    addColumn("Quarter-finals", BRACKET_LAYOUT.qfLeft, "bv-col-left");
    addColumn("Semi-finals", BRACKET_LAYOUT.sfLeft, "bv-col-left");

    canvas.appendChild(buildCenterFinal(options));

    addColumn("Semi-finals", BRACKET_LAYOUT.sfRight, "bv-col-right");
    addColumn("Quarter-finals", BRACKET_LAYOUT.qfRight, "bv-col-right");
    addColumn("Round of 16", BRACKET_LAYOUT.r16Right, "bv-col-right");
    addColumn("Round of 32", BRACKET_LAYOUT.r32Right, "bv-col-right");

    viewport.appendChild(canvas);
    container.appendChild(viewport);
  }

  function renderGroups(container, options) {
    const {
      teamsDb,
      groupsData,
      groupStandings,
      groupMatchScores,
      groupMatchesFlat,
      legacyKnockoutOnly
    } = options;

    container.innerHTML = "";

    if (legacyKnockoutOnly) {
      container.innerHTML =
        '<p class="bv-muted">Group stage was not saved with this bracket — only knockout picks are available.</p>';
      return;
    }

    const grid = document.createElement("div");
    grid.className = "bv-groups-grid";

    Object.keys(groupsData)
      .sort()
      .forEach((gLetter) => {
        const card = document.createElement("div");
        card.className = "bv-group-card glass-panel";

        const title = document.createElement("div");
        title.className = "bv-group-title";
        title.textContent = `Group ${gLetter}`;
        card.appendChild(title);

        const table = document.createElement("table");
        table.className = "bv-standings-table";
        table.innerHTML = "<thead><tr><th>#</th><th>Team</th><th>Pts</th></tr></thead>";
        const tbody = document.createElement("tbody");
        const order = groupStandings[gLetter] || groupsData[gLetter];
        order.forEach((teamId, idx) => {
          const stats = options.getStandingStats
            ? options.getStandingStats(gLetter, teamId)
            : null;
          const pts = stats != null ? stats.pts : "—";
          const tr = document.createElement("tr");
          tr.innerHTML = `<td>${idx + 1}</td><td>${teamLabel(teamsDb, teamId)}</td><td class="bv-stat">${pts}</td>`;
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        card.appendChild(table);

        const matches = document.createElement("ul");
        matches.className = "bv-match-list";
        (groupMatchesFlat || [])
          .filter((m) => m.group === gLetter)
          .sort((a, b) => a.matchIndex - b.matchIndex)
          .forEach((m) => {
            const key = `${gLetter}_${m.matchIndex}`;
            const entry = groupMatchScores[key];
            const li = document.createElement("li");
            const scoreText = formatGroupResult(entry, m.teamA, m.teamB, teamsDb);
            li.innerHTML =
              `<span>${teamLabel(teamsDb, m.teamA)} vs ${teamLabel(teamsDb, m.teamB)}</span>` +
              `<strong>${scoreText || "—"}</strong>`;
            matches.appendChild(li);
          });
        card.appendChild(matches);
        grid.appendChild(card);
      });

    container.appendChild(grid);
  }

  function render(options) {
    if (options.knockoutEl) renderKnockoutTree(options.knockoutEl, options);
    if (options.groupsEl) renderGroups(options.groupsEl, options);
  }

  return { render, renderKnockoutTree, renderGroups };
});
