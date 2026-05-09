import { transcriptionValidator } from "../../../src/validators/transcriptionValidator";

describe("transcriptionValidator", () => {
  it("should pass when confidence is above threshold", async () => {
    const result = await transcriptionValidator("hello world", 0.9);
    expect(result.passed).toBe(true);
    expect(result.details).toContain("acceptable");
  });

  it("should fail when confidence is too low", async () => {
    const result = await transcriptionValidator("hello world", 0.5);
    expect(result.passed).toBe(false);
    expect(result.details).toContain("low confidence");
  });

  it("should fail when transcript is empty", async () => {
    const result = await transcriptionValidator("", 0.95);
    expect(result.passed).toBe(false);
    expect(result.details).toContain("too short");
  });
});
