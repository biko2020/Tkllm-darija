import { Redis } from 'ioredis';
const redis = new Redis(process.env.REDIS_URL!);

export const isDuplicateRequest = async (key: string): Promise<boolean> => {
  const result = await redis.set(key, 'locked', 'EX', 3600, 'NX');
  return result === null; // If null, the key already existed
};