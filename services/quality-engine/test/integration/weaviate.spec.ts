import { WeaviateClientMock } from "../utils/scoring.mock";

describe("Weaviate Integration", () => {
  it("should insert and query vectors", async () => {
    const client = new WeaviateClientMock();
    await client.insertVector("sample1", [0.1, 0.2, 0.3]);
    const result = await client.querySimilar([0.1, 0.2, 0.3]);
    expect(result).toHaveLength(1);
  });
});
