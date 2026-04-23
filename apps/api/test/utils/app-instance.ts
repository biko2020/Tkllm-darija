import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";

let app: INestApplication | null = null;

/**
 * Returns a singleton NestJS TestingModule instance.
 * Ensures all E2E tests share the same app context.
 */
export async function getAppInstance(): Promise<INestApplication> {
  if (!app) {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }
  return app;
}

/**
 * Gracefully closes the app instance.
 * Call this in global teardown or after all tests.
 */
export async function closeAppInstance() {
  if (app) {
    await app.close();
    app = null;
  }
}
