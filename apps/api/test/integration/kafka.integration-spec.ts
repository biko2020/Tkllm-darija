import { Kafka } from "kafkajs";

describe("Kafka Integration", () => {
  let kafka: Kafka;

  beforeAll(() => {
    kafka = new Kafka({
      clientId: "test-client",
      brokers: (process.env.KAFKA_BROKERS || "").split(","),
    });
  });

  it("should connect to Kafka broker", async () => {
    const admin = kafka.admin();
    await admin.connect();
    const topics = await admin.listTopics();
    expect(Array.isArray(topics)).toBe(true);
    await admin.disconnect();
  });
});
