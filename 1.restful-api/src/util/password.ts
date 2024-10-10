import { hashSync, compareSync } from 'bcrypt';
import { IsStrongPasswordOptions } from 'class-validator';

export function hashPassword(password: string): string {
  const hash = hashSync(password, 10);
  return hash;
}

export function isMatchPassword(
  password: string,
  passwordHash: string,
): boolean {
  const isValid = compareSync(password, passwordHash);
  return isValid;
}

export const isStrongPasswordOptions: IsStrongPasswordOptions = {
  minLength: 8,
  minLowercase: 1,
  minNumbers: 1,
  minSymbols: 1,
  minUppercase: 1,
};
