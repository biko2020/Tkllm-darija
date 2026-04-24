import dotenv from "dotenv";
import { QualityEngine } from "../src/scorer";

dotenv.config();

export async function getQualityEngineInstance() {
  // Initialize engine with mocks or real config depending on env
  return new QualityEngine();
}
