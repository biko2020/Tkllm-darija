import { getQualityEngineInstance } from "../setup";

describe("Quality Engine E2E", () => {
  let engine;

  beforeAll(async () => {
    engine = await getQualityEngineInstance();
  });

  it("should process review request and return decision", async () => {
    const decision = await engine.review({ transcript: "test audio" });
    expect(["approve", "reject", "needs-review"]).toContain(decision);
  });
});
