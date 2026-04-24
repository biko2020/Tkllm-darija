import { KafkaServiceMock } from "../utils/kafka.mock";

describe("Kafka Integration", () => {
  it("should send and consume messages", async () => {
    const kafka = new KafkaServiceMock();
    await kafka.sendMessage("transcription.requested", { id: "123" });
    const msg = await kafka.consumeMessage("transcription.completed");
    expect(msg.value).toBe("mock-message");
  });
});
