export class KafkaServiceMock {
  async sendMessage(topic: string, message: any) {
    console.log(`Mock Kafka send to ${topic}:`, message);
    return { success: true };
  }

  async consumeMessage(topic: string) {
    console.log(`Mock Kafka consume from ${topic}`);
    return { value: "mock-message" };
  }
}
