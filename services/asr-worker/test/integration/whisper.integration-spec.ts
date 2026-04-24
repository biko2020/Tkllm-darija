import { whisperStub } from "../utils/whisper.stub";

describe("Whisper Integration", () => {
  it("should return mocked transcript", async () => {
    const transcript = await whisperStub(Buffer.from("fake-audio"));
    expect(transcript).toBe("mock transcript");
  });
});
