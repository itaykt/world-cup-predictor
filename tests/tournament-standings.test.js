import { describe, it, expect } from "vitest";
import TournamentData from "../data.js";
import TournamentStandings from "../tournament-standings.js";

const { TEAMS_DB } = TournamentData;

function outcomesForGroup(gLetter, results) {
  const entries = {};
  results.forEach(([matchIndex, outcome]) => {
    entries[`${gLetter}_${matchIndex}`] = TournamentStandings.groupOutcomeEntry(outcome);
  });
  return entries;
}

function legacyScoresForGroup(gLetter, results) {
  const scores = {};
  results.forEach(([matchIndex, scoreA, scoreB]) => {
    scores[`${gLetter}_${matchIndex}`] = { scoreA: String(scoreA), scoreB: String(scoreB) };
  });
  return scores;
}

describe("TournamentStandings.recalculate", () => {
  it("ranks teams by points then FIFA rank (no goal tiebreakers)", () => {
    const groupMatchScores = outcomesForGroup("A", [
      [0, "a"],
      [1, "a"],
      [2, "a"],
      [3, "b"],
      [4, "b"],
      [5, "b"]
    ]);

    const { groupStandings } = TournamentStandings.recalculate(groupMatchScores);
    expect(groupStandings.A[0]).toBe("mex");
    expect(groupStandings.A[1]).toBe("kor");
    expect(groupStandings.A[2]).toBe("cze");
    expect(groupStandings.A[3]).toBe("rsa");
  });

  it("uses FIFA rank when points are tied", () => {
    const groupMatchScores = outcomesForGroup("A", [
      [0, "d"],
      [1, "d"],
      [2, "d"],
      [3, "d"],
      [4, "d"],
      [5, "d"]
    ]);

    const { groupStandings } = TournamentStandings.recalculate(groupMatchScores);
    expect(groupStandings.A[0]).toBe("mex");
    expect(TEAMS_DB.mex.rank).toBeLessThan(TEAMS_DB.rsa.rank);
  });

  it("normalizes legacy score objects into outcomes", () => {
    const groupMatchScores = legacyScoresForGroup("A", [
      [0, 2, 1],
      [1, 1, 2],
      [2, 1, 1],
      [3, 2, 0],
      [4, 0, 2],
      [5, 0, 1]
    ]);
    const { groupStandings } = TournamentStandings.recalculate(groupMatchScores);
    expect(groupStandings.A).toHaveLength(4);
    expect(TournamentStandings.isEnteredGroupResult(groupMatchScores.A_0)).toBe(true);
  });

  it("selects top eight third-place teams for wildcards", () => {
    const groupMatchScores = {};
    Object.keys(TournamentData.GROUPS_DATA).forEach((g) => {
      for (let matchIndex = 0; matchIndex < 6; matchIndex++) {
        const key = `${g}_${matchIndex}`;
        groupMatchScores[key] = TournamentStandings.groupOutcomeEntry(matchIndex < 2 ? "a" : "b");
      }
    });

    const { thirdPlaceQualifiers } = TournamentStandings.recalculate(groupMatchScores);
    expect(thirdPlaceQualifiers).toHaveLength(8);
    expect(new Set(thirdPlaceQualifiers).size).toBe(8);
  });
});

describe("TournamentStandings.calculateThirdPlacedList", () => {
  it("orders third-place teams by points then FIFA rank", () => {
    const groupMatchScores = outcomesForGroup("A", [
      [0, "a"],
      [1, "a"],
      [2, "b"],
      [3, "a"],
      [4, "b"],
      [5, "b"]
    ]);
    const { groupStandings } = TournamentStandings.recalculate(groupMatchScores);
    const thirds = TournamentStandings.calculateThirdPlacedList(groupMatchScores, groupStandings);
    expect(thirds[0].teamId).toBe(groupStandings.A[2]);
    expect(thirds[0].pts).toBe(3);
  });
});

describe("TournamentStandings.isEnteredGroupResult", () => {
  it("accepts outcome objects and rejects empty legacy scores", () => {
    expect(TournamentStandings.isEnteredGroupResult({ outcome: "a" })).toBe(true);
    expect(TournamentStandings.isEnteredGroupResult({ scoreA: "", scoreB: "1" })).toBe(false);
    expect(TournamentStandings.isEnteredGroupResult({ scoreA: "1", scoreB: "0" })).toBe(true);
  });
});
