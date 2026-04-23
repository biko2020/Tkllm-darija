import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Prisma Integration", () => {
  it("should connect to the database", async () => {
    const result = await prisma.$queryRaw`SELECT 1+1 AS result`;
    expect(result[0].result).toBe(2);
  });

  it("should create and fetch a user", async () => {
    const user = await prisma.user.create({
      data: { email: "integration@example.com", role: "contributor", passwordHash: "hashed" },
    });

    const fetched = await prisma.user.findUnique({ where: { id: user.id } });
    expect(fetched?.email).toBe("integration@example.com");
  });
});
