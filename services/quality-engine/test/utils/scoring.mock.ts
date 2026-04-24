export class WeaviateClientMock {
  async insertVector(id: string, vector: number[]) {
    return { success: true };
  }
  async querySimilar(vector: number[]) {
    return [{ id: "sample1", score: 0.9 }];
  }
}

export class S3ServiceMock {
  async uploadFile(bucket: string, key: string, content: Buffer) {
    return { url: `https://mock-s3/${bucket}/${key}` };
  }
  async getFile(bucket: string, key: string) {
    return Buffer.from("mock-file-content");
  }
}
