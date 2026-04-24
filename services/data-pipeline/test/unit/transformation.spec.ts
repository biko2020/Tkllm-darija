import { cleanRecord } from "../../flows/cleaning.flow";

describe("Transformation Unit Tests", () => {
  it("should normalize text fields", () => {
    const input = { transcript: "  Hello Darija!! " };
    const result = cleanRecord(input);
    expect(result.transcript).toBe("hello darija");
  });
});
