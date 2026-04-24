import { applyHeuristics } from "../../src/scorer";

describe("Heuristics Unit Tests", () => {
  it("should flag low confidence transcripts", () => {
    const decision = applyHeuristics({ score: 0.3 });
    expect(decision).toBe("reject");
  });
});
