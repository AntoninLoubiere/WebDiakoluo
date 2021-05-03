import {generate, verify} from 'password-hash'

/**
 * Hash a password.
 * @param pass the password to hash
 * @returns the password hashed (a string of 89 characters)
 */
export function hashPass(pass) {
    return generate(pass, {algorithm: "sha256", iterations: 1000, saltLength: 12});
}

/**
 * Verify if it is the correct password.
 * @param pass the clear password
 * @param hash the hashed password
 * @returns if the password correspond to the password hashed
 */
export function verifyPass(pass, hash) {
    return verify(pass, hash);
}
