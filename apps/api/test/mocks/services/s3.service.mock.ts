export class S3ServiceMock {
  async uploadFile(bucket: string, key: string, content: Buffer) {
    console.log(`Mock S3 upload to ${bucket}/${key}`);
    return { url: `https://mock-s3/${bucket}/${key}` };
  }

  async getFile(bucket: string, key: string) {
    console.log(`Mock S3 get from ${bucket}/${key}`);
    return Buffer.from("mock-file-content");
  }
}
