import dotenv from "dotenv";
import { cleanDbBeforeEach } from "./utils/database-cleaner";
import { getAppInstance, closeAppInstance } from "./utils/app-instance";

// Load environment variables
dotenv.config();

// Global Jest hooks
beforeAll(async () => {
  // Ensure NestJS app is initialized before tests
  await getAppInstance();
});

beforeEach(async () => {
  // Reset DB state before each test
  await cleanDbBeforeEach();
});

afterAll(async () => {
  // Gracefully close NestJS app after all tests
  await closeAppInstance();
});
