/* eslint-disable prettier/prettier */
import * as crypto from 'crypto';

/**
 * Hashes a password using SHA-256.
 * Using built-in crypto module to avoid external dependencies.
 */
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}
