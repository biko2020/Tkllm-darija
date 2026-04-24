import { processAudio } from "../../src/processor";

describe("Processor Unit Tests", () => {
  it("should return transcript for valid audio buffer", async () => {
    const buffer = Buffer.from("fake-audio");
    const transcript = await processAudio(buffer);
    expect(typeof transcript).toBe("string");
  });
});


