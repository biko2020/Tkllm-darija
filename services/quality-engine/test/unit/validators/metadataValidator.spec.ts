import { metadataValidator } from "../../../src/validators/metadataValidator";

describe("metadataValidator", () => {
  it("should pass when all required fields are present", async () => {
    const meta = { contributorId: "123", age: 25, gender: "M", region: "Casablanca", consent: true };
    const result = await metadataValidator(meta);
    expect(result.passed).toBe(true);
    expect(result.details).toContain("compliant");
  });

  it("should fail when missing fields", async () => {
    const meta = { contributorId: "123", consent: true };
    const result = await metadataValidator(meta);
    expect(result.passed).toBe(false);
    expect(result.details).toContain("Missing fields");
  });

  it("should fail when consent is false", async () => {
    const meta = { contributorId: "123", age: 25, gender: "F", region: "Rabat", consent: false };
    const result = await metadataValidator(meta);
    expect(result.passed).toBe(false);
    expect(result.details).toContain("Missing fields");
  });
});
