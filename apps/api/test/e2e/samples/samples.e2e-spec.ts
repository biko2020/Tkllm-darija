import request from "supertest";
import { getAppInstance } from "../../utils/app-instance";
import { seedTestUser } from "../../utils/seed-user";
import { seedTestSample } from "../../utils/seed-sample";

describe("Samples E2E", () => {
  let app;
  let token;

  beforeAll(async () => {
    app = await getAppInstance();
    const seeded = await seedTestUser({ email: "sampleuser@example.com" });
    token = seeded.token;
    await seedTestSample(seeded.user.id, { transcript: "Hello Darija" });
  });

  it("GET /samples should list seeded samples", async () => {
    const res = await request(app.getHttpServer())
      .get("/samples")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body[0].transcript).toBe("Hello Darija");
  });
});
