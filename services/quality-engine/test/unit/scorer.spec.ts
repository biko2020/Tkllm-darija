import { scoreSample } from "../../src/scorer";

describe("Scorer Unit Tests", () => {
  it("should return a numeric score between 0 and 1", () => {
    const result = scoreSample({ transcript: "hello world" });
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });
});
