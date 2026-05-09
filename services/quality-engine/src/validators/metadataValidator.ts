import { ValidationResult } from "../types";

interface Metadata {
  contributorId: string;
  age?: number;
  gender?: string;
  region?: string;
  consent?: boolean;
}

export async function metadataValidator(meta: Metadata): Promise<ValidationResult> {
  const requiredFields = ["contributorId", "age", "gender", "region", "consent"];
  const missing = requiredFields.filter(f => !(meta as any)[f]);
  const isValid = missing.length === 0 && meta.consent === true;

  return {
    validator: "metadataValidator",
    passed: isValid,
    details: isValid ? "Metadata complete and compliant" : `Missing fields: ${missing.join(", ")}`,
  };
}
