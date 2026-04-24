import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Database Integration Tests", () => {
  it("should insert and retrieve records", async () => {
    const record = await prisma.dataset.create({
      data: { name: "test-dataset", status: "cleaned" },
    });
    const fetched = await prisma.dataset.findUnique({ where: { id: record.id } });
    expect(fetched?.name).toBe("test-dataset");
  });
});
