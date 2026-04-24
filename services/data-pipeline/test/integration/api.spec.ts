import axios from "axios";

describe("API Integration Tests", () => {
  it("should fetch data from external API", async () => {
    const res = await axios.get("https://mock-api/data");
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty("items");
  });
});
