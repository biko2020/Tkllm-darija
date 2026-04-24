import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from '../../src/shared/redis/redis.service'; // Adjust path based on your exact shared module location

describe('Redis Integration', () => {
  let redisService: RedisService;
  let redisClient: Redis;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
        }),
      ],
      providers: [RedisService, ConfigService],
    }).compile();

    redisService = module.get<RedisService>(RedisService);
    
    // Create a direct client to verify data independently of the service logic
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    });
  });

  afterAll(async () => {
    await redisClient.quit();
  });

  beforeEach(async () => {
    // Clear the test database before each run to ensure isolation
    await redisClient.flushdb();
  });

  describe('Basic Cache Operations', () => {
    it('should set and get a value from Redis', async () => {
      const key = 'test-key';
      const value = { userId: 'contributor-123', action: 'upload' };

      await redisService.set(key, value, 3600);
      const retrieved = await redisService.get(key);

      expect(retrieved).toEqual(value);
    });

    it('should return null for expired or non-existent keys', async () => {
      const result = await redisService.get('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('Rate Limiting / Atomic Increments', () => {
    it('should correctly increment a counter for API throttling', async () => {
      const ip = '192.168.1.1';
      const key = `ratelimit:${ip}`;

      // Simulate 3 rapid requests
      await redisService.increment(key);
      await redisService.increment(key);
      const currentCount = await redisService.increment(key);

      expect(currentCount).toBe(3);
      
      // Verify TTL was set (e.g., 60 seconds)
      const ttl = await redisClient.ttl(key);
      expect(ttl).toBeGreaterThan(0);
    });
  });

  describe('Security: Token Blacklisting', () => {
    it('should blacklist a JWT until its expiry time', async () => {
      const token = 'eyJhbGciOiJIUzI1Ni...';
      const expiry = 60; // 1 minute

      await redisService.blacklistToken(token, expiry);
      const isBlacklisted = await redisService.isTokenBlacklisted(token);

      expect(isBlacklisted).toBe(true);
    });
  });
});