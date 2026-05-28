import { describe, it, expect } from "vitest";
import TournamentData from "../data.js";
import TournamentStandings from "../tournament-standings.js";

const { TEAMS_DB } = TournamentData;

function scoresForGroup(gLetter, results) {
  const scores = {};
  results.forEach(([matchIndex, scoreA, scoreB]) => {
    scores[`${gLetter}_${matchIndex}`] = { scoreA: String(scoreA), scoreB: String(scoreB) };
  });
  return scores;
}

describe("TournamentStandings.recalculate", () => {
  it("ranks teams by points then goal difference then goals for", () => {
    const groupMatchScores = scoresForGroup("A", [
      [0, 3, 0],
      [1, 0, 0],
      [2, 2, 0],
      [3, 0, 2],
      [4, 0, 3],
      [5, 0, 1]
    ]);

    const { groupStandings } = TournamentStandings.recalculate(groupMatchScores);
    expect(groupStandings.A[0]).toBe("mex");
    expect(groupStandings.A[1]).toBe("cze");
    expect(groupStandings.A[2]).toBe("kor");
    expect(groupStandings.A[3]).toBe("rsa");
  });

  it("uses FIFA rank as final tiebreaker when pts/gd/gf are equal", () => {
    const groupMatchScores = {
      A_0: { scoreA: "1", scoreB: "1" },
      A_1: { scoreA: "1", scoreB: "1" },
      A_2: { scoreA: "1", scoreB: "1" },
      A_3: { scoreA: "1", scoreB: "1" },
      A_4: { scoreA: "1", scoreB: "1" },
      A_5: { scoreA: "1", scoreB: "1" }
    };

    const { groupStandings } = TournamentStandings.recalculate(groupMatchScores);
    expect(groupStandings.A[0]).toBe("mex");
    expect(TEAMS_DB.mex.rank).toBeLessThan(TEAMS_DB.rsa.rank);
  });

  it("selects top eight third-place teams for wildcards", () => {
    const groupMatchScores = {};
    Object.keys(TournamentData.GROUPS_DATA).forEach((g) => {
      TournamentData.GROUPS_DATA[g].forEach((teamId, idx) => {
        for (let matchIndex = 0; matchIndex < 6; matchIndex++) {
          const key = `${g}_${matchIndex}`;
          const isWin = idx === 0;
          groupMatchScores[key] = isWin
            ? { scoreA: "2", scoreB: "0" }
            : { scoreA: "0", scoreB: "2" };
        }
      });
    });

    const { thirdPlaceQualifiers } = TournamentStandings.recalculate(groupMatchScores);
    expect(thirdPlaceQualifiers).toHaveLength(8);
    expect(new Set(thirdPlaceQualifiers).size).toBe(8);
  });
});

describe("TournamentStandings.calculateThirdPlacedList", () => {
  it("orders third-place teams independently of full table stats", () => {
    const groupMatchScores = scoresForGroup("A", [
      [0, 3, 0],
      [1, 3, 0],
      [2, 0, 3],
      [3, 3, 0],
      [4, 0, 3],
      [5, 0, 3]
    ]);
    const groupStandings = { A: ["mex", "kor", "rsa", "cze"] };

    const thirds = TournamentStandings.calculateThirdPlacedList(groupMatchScores, groupStandings);
    expect(thirds[0].teamId).toBe("rsa");
    expect(thirds[0].pts).toBe(3);
  });
});

describe("TournamentStandings.isEnteredScore", () => {
  it("treats empty strings as not entered", () => {
    expect(TournamentStandings.isEnteredScore({ scoreA: "", scoreB: "1" })).toBe(false);
    expect(TournamentStandings.isEnteredScore({ scoreA: "1", scoreB: "0" })).toBe(true);
  });
});
