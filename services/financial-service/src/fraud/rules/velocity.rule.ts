import { Redis } from 'ioredis';
import { config } from '../../config/configuration';

const redis = new Redis(config.redis.url);

export const checkVelocity = async (userId: string): Promise<boolean> => {
  const key = `payout:velocity:${userId}`;
  const count = await redis.incr(key);
  
  if (count === 1) await redis.expire(key, 86400); // 24-hour window
  
  return count <= 5; // Limit to 5 payouts per day
};