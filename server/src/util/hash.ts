import crypto from 'crypto'
import bcrypt from 'bcrypt'

const DEFAULT_SALT_ROUNDS = 10

/**
 * Randomly generates and returns a 6 digit OTP.
 * @returns 6 digit OTP string
 */
export const generateRandomDigits = (length: number): string => {
  const chars = '0123456789'
  // Generates cryptographically strong pseudo-random data.
  // The size argument is a number indicating the number of bytes to generate.
  const rnd = crypto.randomBytes(length)
  const d = chars.length / 256
  const digits = new Array(length)
  for (let i = 0; i < length; i++) {
    digits[i] = chars[Math.floor(rnd[i] * d)]
  }
  return digits.join('')
}

// should verifyHash be async?
export const verifyHash = (data: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(data, hash)
}

export const hashData = (data: string): Promise<string> =>
  bcrypt.hash(data, DEFAULT_SALT_ROUNDS)
