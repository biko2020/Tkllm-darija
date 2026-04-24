import { S3ServiceMock } from "../utils/s3.mock";

describe("S3 Integration", () => {
  it("should upload and retrieve file", async () => {
    const s3 = new S3ServiceMock();
    const upload = await s3.uploadFile("bucket", "file.txt", Buffer.from("hello"));
    expect(upload.url).toContain("mock-s3");

    const file = await s3.getFile("bucket", "file.txt");
    expect(file.toString()).toBe("mock-file-content");
  });
});
