export class S3ServiceMock {
  async uploadFile(bucket: string, key: string, content: Buffer) {
    return { url: `https://mock-s3/${bucket}/${key}` };
  }
  async getFile(bucket: string, key: string) {
    return Buffer.from("mock-file-content");
  }
}
