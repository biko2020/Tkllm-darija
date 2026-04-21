import { checkVelocity } from './rules/velocity.rule';
import { checkGeoAnomaly } from './rules/geo-anomaly.rule';

export class FraudService {
  async evaluateTransaction(userId: string, context: { ip: string; region: string }): Promise<boolean> {
    const velocityOk = await checkVelocity(userId);
    const geoOk = await checkGeoAnomaly(context.ip, context.region);

    return velocityOk && geoOk;
  }
}