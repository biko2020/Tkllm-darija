import { S3ServiceMock } from "../utils/scoring.mock";

describe("Storage Integration", () => {
  it("should upload and retrieve metadata", async () => {
    const s3 = new S3ServiceMock();
    const upload = await s3.uploadFile("bucket", "meta.json", Buffer.from("{}"));
    expect(upload.url).toContain("mock-s3");

    const file = await s3.getFile("bucket", "meta.json");
    expect(file.toString()).toBe("mock-file-content");
  });
});
