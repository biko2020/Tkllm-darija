export const checkGeoAnomaly = async (ipAddress: string, userHomeRegion: string): Promise<boolean> => {
  // Simple logic: If request comes from outside Morocco but user is local contributor
  // In production, use a GeoIP library or MaxMind
  const isMoroccanIP = ipAddress.startsWith('105.') || ipAddress.startsWith('196.'); 
  return isMoroccanIP; 
};