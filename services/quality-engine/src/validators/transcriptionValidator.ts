import { ValidationResult } from "../types";

export async function transcriptionValidator(transcript: string, confidence: number): Promise<ValidationResult> {
  const threshold = 0.85; // configurable
  const isValid = confidence >= threshold && transcript.length > 0;
  return {
    validator: "transcriptionValidator",
    passed: isValid,
    details: isValid ? "Transcript confidence acceptable" : "Transcript too short or low confidence",
  };
}
