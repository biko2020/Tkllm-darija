import { selectSamplesForReview } from "../../src/active-learning";

describe("Active Learning Unit Tests", () => {
  it("should select samples with borderline scores", () => {
    const samples = [
      { id: "1", score: 0.49 },
      { id: "2", score: 0.95 }
    ];
    const selected = selectSamplesForReview(samples);
    expect(selected.map(s => s.id)).toContain("1");
  });
});
