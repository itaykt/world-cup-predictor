/**
 * Group-stage standings and third-place wildcard ranking (Swipe Cup: W/D/L only).
 * Tiebreaker when points are equal: better FIFA world ranking (lower rank number).
 */
(function (root, factory) {
  const TournamentStandings = factory();
  root.TournamentStandings = TournamentStandings;
  if (typeof module === "object" && module.exports) {
    module.exports = TournamentStandings;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : this, function () {
  const { TEAMS_DB, GROUPS_DATA, GROUP_STAGE_MATCHES_FLAT } = (
    typeof module === "object" && module.exports
      ? require("./data.js")
      : globalThis.TournamentData
  );

  /** @returns {'a'|'b'|'d'|null} */
  function normalizeGroupOutcome(entry) {
    if (!entry || typeof entry !== "object") return null;
    if (entry.outcome === "a" || entry.outcome === "b" || entry.outcome === "d") {
      return entry.outcome;
    }
    if (entry.scoreA === "" || entry.scoreB === "" || entry.scoreA == null || entry.scoreB == null) {
      return null;
    }
    const sA = parseInt(entry.scoreA, 10);
    const sB = parseInt(entry.scoreB, 10);
    if (Number.isNaN(sA) || Number.isNaN(sB)) return null;
    if (sA > sB) return "a";
    if (sB > sA) return "b";
    return "d";
  }

  function isEnteredGroupResult(entry) {
    return normalizeGroupOutcome(entry) !== null;
  }

  /** @deprecated alias */
  function isEnteredScore(entry) {
    return isEnteredGroupResult(entry);
  }

  function createEmptyStats(teamId, groupLetter) {
    return {
      teamId,
      group: groupLetter,
      p: 0,
      w: 0,
      d: 0,
      l: 0,
      pts: 0
    };
  }

  function applyMatchOutcome(stats, teamAId, teamBId, outcome) {
    stats[teamAId].p++;
    stats[teamBId].p++;
    if (outcome === "a") {
      stats[teamAId].w++;
      stats[teamAId].pts += 3;
      stats[teamBId].l++;
    } else if (outcome === "b") {
      stats[teamBId].w++;
      stats[teamBId].pts += 3;
      stats[teamAId].l++;
    } else {
      stats[teamAId].d++;
      stats[teamBId].d++;
      stats[teamAId].pts += 1;
      stats[teamBId].pts += 1;
    }
  }

  /** Points, then FIFA rank (lower number = better). */
  function compareStatsRows(a, b) {
    if (b.pts !== a.pts) return b.pts - a.pts;
    return TEAMS_DB[a.teamId].rank - TEAMS_DB[b.teamId].rank;
  }

  function computeTeamStats(groupLetter, teamId, groupMatchScores) {
    const stats = createEmptyStats(teamId, groupLetter);

    GROUP_STAGE_MATCHES_FLAT.forEach((m) => {
      if (m.group !== groupLetter) return;
      if (m.teamA !== teamId && m.teamB !== teamId) return;

      const key = `${groupLetter}_${m.matchIndex}`;
      const outcome = normalizeGroupOutcome(groupMatchScores[key]);
      if (!outcome) return;

      const isTeamA = m.teamA === teamId;
      stats.p++;
      if (outcome === "d") {
        stats.d++;
        stats.pts += 1;
      } else if ((outcome === "a" && isTeamA) || (outcome === "b" && !isTeamA)) {
        stats.w++;
        stats.pts += 3;
      } else {
        stats.l++;
      }
    });

    return stats;
  }

  function buildGroupTable(groupLetter, groupMatchScores) {
    const teams = GROUPS_DATA[groupLetter];
    const stats = {};
    teams.forEach((t) => {
      stats[t] = createEmptyStats(t, groupLetter);
    });

    GROUP_STAGE_MATCHES_FLAT.forEach((m) => {
      if (m.group !== groupLetter) return;
      const key = `${groupLetter}_${m.matchIndex}`;
      const outcome = normalizeGroupOutcome(groupMatchScores[key]);
      if (!outcome) return;
      applyMatchOutcome(stats, m.teamA, m.teamB, outcome);
    });

    return Object.values(stats)
      .sort(compareStatsRows)
      .map((row) => row.teamId);
  }

  function calculateThirdPlacedList(groupMatchScores, groupStandings) {
    const standings = groupStandings || {};
    const thirdsList = [];

    Object.keys(GROUPS_DATA).forEach((gLetter) => {
      const teamId = standings[gLetter] ? standings[gLetter][2] : GROUPS_DATA[gLetter][2];
      thirdsList.push(computeTeamStats(gLetter, teamId, groupMatchScores));
    });

    return thirdsList.sort(compareStatsRows);
  }

  function pickTop8ThirdPlace(thirdsList) {
    return thirdsList.slice(0, 8).map((row) => row.teamId);
  }

  function recalculate(groupMatchScores) {
    const groupStandings = {};
    Object.keys(GROUPS_DATA).forEach((gLetter) => {
      groupStandings[gLetter] = buildGroupTable(gLetter, groupMatchScores);
    });
    const thirdsList = calculateThirdPlacedList(groupMatchScores, groupStandings);
    return {
      groupStandings,
      thirdPlaceQualifiers: pickTop8ThirdPlace(thirdsList)
    };
  }

  function getTeamSummaryStats(groupLetter, teamId, groupMatchScores) {
    const full = computeTeamStats(groupLetter, teamId, groupMatchScores);
    return { pts: full.pts };
  }

  function groupOutcomeEntry(outcome) {
    return { outcome };
  }

  return {
    normalizeGroupOutcome,
    isEnteredGroupResult,
    isEnteredScore,
    groupOutcomeEntry,
    computeTeamStats,
    buildGroupTable,
    calculateThirdPlacedList,
    pickTop8ThirdPlace,
    recalculate,
    getTeamSummaryStats,
    compareStatsRows
  };
});
