/**
 * Read-only group standings + knockout results (no full simulator UI).
 */
(function (root, factory) {
  const BracketView = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = BracketView;
  } else {
    root.BracketView = BracketView;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : this, function () {
  const KNOCKOUT_ROUNDS = [
    { title: "Round of 32", from: 73, to: 88 },
    { title: "Round of 16", from: 89, to: 96 },
    { title: "Quarter-finals", from: 97, to: 100 },
    { title: "Semi-finals", from: 101, to: 102 },
    { title: "Third place", ids: [103] },
    { title: "Final", ids: [104] }
  ];

  function teamLabel(teamsDb, teamId) {
    if (!teamId || !teamsDb[teamId]) return "—";
    const t = teamsDb[teamId];
    return `${t.flag} ${t.name}`;
  }

  function formatScore(score) {
    if (!score || score.scoreA === "" || score.scoreB === "") return "";
    return `${score.scoreA}–${score.scoreB}`;
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
        '<p class="bv-muted">Group stage scores were not included in this shared link — knockout picks only.</p>';
      return;
    }

    const heading = document.createElement("h3");
    heading.className = "bv-section-title";
    heading.innerHTML = '<i class="fa-solid fa-table"></i> Group stage';
    container.appendChild(heading);

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
            const score = groupMatchScores[key];
            const li = document.createElement("li");
            const scoreText = formatScore(score);
            li.innerHTML = `<span>${teamLabel(teamsDb, m.teamA)} vs ${teamLabel(teamsDb, m.teamB)}</span>` +
              `<strong>${scoreText || "—"}</strong>`;
            matches.appendChild(li);
          });
        card.appendChild(matches);
        grid.appendChild(card);
      });

    container.appendChild(grid);
  }

  function renderKnockout(container, options) {
    const { teamsDb, knockoutPicks, knockoutScores, resolveMatch } = options;
    container.innerHTML = "";

    const heading = document.createElement("h3");
    heading.className = "bv-section-title";
    heading.innerHTML = '<i class="fa-solid fa-sitemap"></i> Knockout';
    container.appendChild(heading);

    KNOCKOUT_ROUNDS.forEach((round) => {
      const section = document.createElement("section");
      section.className = "bv-knockout-round";

      const h4 = document.createElement("h4");
      h4.className = "bv-round-title";
      h4.textContent = round.title;
      section.appendChild(h4);

      const list = document.createElement("div");
      list.className = "bv-knockout-matches";

      const matchIds = round.ids
        ? round.ids
        : Array.from({ length: round.to - round.from + 1 }, (_, i) => round.from + i);

      matchIds.forEach((mId) => {
        const resolved = resolveMatch(mId);
        if (!resolved) return;

        const { teamA, teamB } = resolved;
        const winnerId = knockoutPicks[mId];
        const score = knockoutScores[mId];
        const scoreText = formatScore(score);

        const row = document.createElement("div");
        row.className = "bv-knockout-row glass-panel";

        const slotA = document.createElement("span");
        slotA.className = "bv-team" + (winnerId === teamA ? " bv-winner" : "");
        slotA.textContent = teamLabel(teamsDb, teamA);

        const slotB = document.createElement("span");
        slotB.className = "bv-team" + (winnerId === teamB ? " bv-winner" : "");
        slotB.textContent = teamLabel(teamsDb, teamB);

        const mid = document.createElement("span");
        mid.className = "bv-vs";
        mid.textContent = scoreText || "vs";

        row.appendChild(slotA);
        row.appendChild(mid);
        row.appendChild(slotB);
        list.appendChild(row);
      });

      section.appendChild(list);
      container.appendChild(section);
    });
  }

  function render(options) {
    const groupsEl = options.groupsEl;
    const knockoutEl = options.knockoutEl;
    if (!groupsEl || !knockoutEl) return;

    renderGroups(groupsEl, options);
    renderKnockout(knockoutEl, options);
  }

  return { render, renderGroups, renderKnockout };
});
