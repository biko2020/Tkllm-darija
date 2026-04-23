import request from "supertest";
import { getAppInstance } from "../../utils/app-instance";
import { seedTestUser } from "../../utils/seed-user";
import { seedTestSample } from "../../utils/seed-sample";
import { seedQualityReview } from "../../utils/seed-quality";

describe("Quality Review E2E", () => {
  let app;
  let reviewerToken;
  let sample;

  beforeAll(async () => {
    app = await getAppInstance();

    const contributor = await seedTestUser({ email: "contributor@example.com" });
    const reviewer = await seedTestUser({ email: "reviewer@example.com", role: "reviewer" });
    reviewerToken = reviewer.token;

    sample = await seedTestSample(contributor.user.id, { transcript: "Needs review" });
    await seedQualityReview(sample.id, reviewer.user.id, { score: 92, comments: "Strong transcript" });
  });

  it("GET /quality should return seeded reviews", async () => {
    const res = await request(app.getHttpServer())
      .get("/quality")
      .set("Authorization", `Bearer ${reviewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body[0].comments).toBe("Strong transcript");
  });
});
