/**
 * Group-stage standings, tiebreakers, and third-place wildcard ranking.
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

  function isEnteredScore(score) {
    return Boolean(score && score.scoreA !== "" && score.scoreB !== "");
  }

  function createEmptyStats(teamId, groupLetter) {
    return {
      teamId,
      group: groupLetter,
      p: 0,
      w: 0,
      d: 0,
      l: 0,
      gd: 0,
      gf: 0,
      ga: 0,
      pts: 0
    };
  }

  function applyMatchResult(stats, teamAId, teamBId, scoreA, scoreB) {
    const sA = parseInt(scoreA, 10);
    const sB = parseInt(scoreB, 10);

    stats[teamAId].p++;
    stats[teamBId].p++;
    stats[teamAId].gf += sA;
    stats[teamBId].gf += sB;
    stats[teamAId].ga += sB;
    stats[teamBId].ga += sA;
    stats[teamAId].gd += sA - sB;
    stats[teamBId].gd += sB - sA;

    if (sA > sB) {
      stats[teamAId].w++;
      stats[teamAId].pts += 3;
      stats[teamBId].l++;
    } else if (sB > sA) {
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

  function compareStatsRows(a, b) {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return TEAMS_DB[a.teamId].rank - TEAMS_DB[b.teamId].rank;
  }

  function computeTeamStats(groupLetter, teamId, groupMatchScores) {
    const stats = createEmptyStats(teamId, groupLetter);

    GROUP_STAGE_MATCHES_FLAT.forEach((m) => {
      if (m.group !== groupLetter) return;
      if (m.teamA !== teamId && m.teamB !== teamId) return;

      const key = `${groupLetter}_${m.matchIndex}`;
      const score = groupMatchScores[key];
      if (!isEnteredScore(score)) return;

      const sA = parseInt(score.scoreA, 10);
      const sB = parseInt(score.scoreB, 10);
      const isTeamA = m.teamA === teamId;
      const myScore = isTeamA ? sA : sB;
      const oppScore = isTeamA ? sB : sA;

      stats.p++;
      stats.gf += myScore;
      stats.ga += oppScore;
      stats.gd += myScore - oppScore;

      if (myScore > oppScore) {
        stats.w++;
        stats.pts += 3;
      } else if (oppScore > myScore) {
        stats.l++;
      } else {
        stats.d++;
        stats.pts += 1;
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
      const score = groupMatchScores[key];
      if (!isEnteredScore(score)) return;
      applyMatchResult(stats, m.teamA, m.teamB, score.scoreA, score.scoreB);
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
    return { gd: full.gd, pts: full.pts };
  }

  return {
    isEnteredScore,
    computeTeamStats,
    buildGroupTable,
    calculateThirdPlacedList,
    pickTop8ThirdPlace,
    recalculate,
    getTeamSummaryStats,
    compareStatsRows
  };
});
