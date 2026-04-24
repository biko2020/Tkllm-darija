import { validateAudioKey } from "../../flows/cleaning.flow";

describe("Regex Unit Tests", () => {
  it("should accept valid S3 keys", () => {
    expect(validateAudioKey("bucket/audio/file.wav")).toBe(true);
  });

  it("should reject invalid keys", () => {
    expect(validateAudioKey("invalid-key")).toBe(false);
  });
});
