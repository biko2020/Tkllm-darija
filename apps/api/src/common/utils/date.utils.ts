export const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const hoursAgo = (hours: number): Date => {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
};