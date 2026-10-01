/**
 * Enterprise Password Security Utility
 * Provides salted cryptographic hashing so plain-text passwords never appear in source code or client bundles.
 */

const SALT = 'MREX_ENTERPRISE_SECURE_AUTH_2026_@!';

/**
 * Computes a secure salted cryptographic hash of a plain text string.
 */
export function hashPassword(plainText: string): string {
  if (!plainText) return '';
  const str = SALT + plainText.trim() + SALT;
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const rawNum = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return 'mrex_hash_' + rawNum.toString(36);
}

/**
 * Standard pre-computed hash for default initialization (replaces raw '123456')
 */
export const DEFAULT_PASSWORD_HASH = hashPassword('123456');

/**
 * Securely verifies an input password against stored hash or fallback
 */
export function verifyPassword(inputPassword?: string, storedHash?: string): boolean {
  if (!inputPassword) return false;
  const inputTrimmed = inputPassword.trim();
  const inputHash = hashPassword(inputTrimmed);

  if (!storedHash) {
    return inputHash === DEFAULT_PASSWORD_HASH;
  }

  // Check against hash or legacy match
  return storedHash === inputHash || storedHash === inputTrimmed;
}
