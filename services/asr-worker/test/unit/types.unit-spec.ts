import { TranscriptionRequest } from "../../src/types";

describe("Types Unit Tests", () => {
  it("should create a valid TranscriptionRequest object", () => {
    const req: TranscriptionRequest = { id: "123", audioPath: "s3://bucket/file.wav" };
    expect(req.id).toBe("123");
    expect(req.audioPath).toContain("s3://");
  });
});
