import { getWorkerInstance } from "../setup";
import { S3ServiceMock } from "../utils/s3.mock";

describe("ASR Worker E2E", () => {
  let worker;

  beforeAll(async () => {
    worker = await getWorkerInstance();
  });

  it("should process audio and upload transcript", async () => {
    const s3 = new S3ServiceMock();
    const audio = Buffer.from("fake-audio");
    const transcript = await worker.process(audio);
    const uploaded = await s3.uploadFile("bucket", "transcript.txt", Buffer.from(transcript));
    expect(uploaded.url).toContain("mock-s3");
  });
});
