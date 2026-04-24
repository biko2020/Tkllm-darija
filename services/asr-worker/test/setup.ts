import dotenv from "dotenv";
import { ASRWorker } from "../src/processor";

dotenv.config();

export async function getWorkerInstance() {
  // Initialize worker with mocks or real config depending on env
  return new ASRWorker();
}
