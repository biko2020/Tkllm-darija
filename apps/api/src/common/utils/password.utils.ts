import * as bcrypt from 'bcrypt';

export const hashPassword = async (plainText: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(plainText, saltRounds);
};

export const comparePassword = async (
  plainText: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(plainText, hashedPassword);
};