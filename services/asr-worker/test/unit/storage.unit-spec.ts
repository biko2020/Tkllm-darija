import { downloadFromS3, uploadToS3 } from "../../src/storage";

describe("Storage Unit Tests", () => {
  it("should upload file and return URL", async () => {
    const result = await uploadToS3("bucket", "file.txt", Buffer.from("content"));
    expect(result.url).toContain("bucket/file.txt");
  });

  it("should download file and return buffer", async () => {
    const result = await downloadFromS3("bucket", "file.txt");
    expect(Buffer.isBuffer(result)).toBe(true);
  });
});
