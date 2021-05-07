import {generate, verify} from 'password-hash'

export const BASE64_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-"

/**
 * Hash a password.
 * @param pass the password to hash
 * @returns the password hashed (a string of 89 characters)
 */
export function hashPass(pass: string): string {
    return generate(pass, {algorithm: "sha256", iterations: 1000, saltLength: 12});
}

/**
 * Verify if it is the correct password.
 * @param pass the clear password
 * @param hash the hashed password
 * @returns if the password correspond to the password hashed
 */
export function verifyPass(pass: string, hash: string): boolean {
    return verify(pass, hash);
}

/**
 * Get a random hash.
 * @param length the length of the hash
 */
export function generateHash(length = 32): string {
    var s = "";
    for (let i = 0; i < length; i++) {
        s += BASE64_CHARS[Math.floor(Math.random() * 64)]        
    }
    return s;
}
