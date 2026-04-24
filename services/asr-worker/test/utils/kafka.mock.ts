export class KafkaServiceMock {
  async sendMessage(topic: string, message: any) {
    return { success: true };
  }
  async consumeMessage(topic: string) {
    return { value: "mock-message" };
  }
}
