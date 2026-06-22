/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/** HKDF salt length (bytes), random per message — yields a fresh key each time. */
export const MESSAGE_SEAL_SALT_LENGTH = 32;

/** AES-GCM nonce length (bytes). */
export const MESSAGE_SEAL_IV_LENGTH = 12;

/** Derived AES-GCM key length (bits). */
export const MESSAGE_SEAL_KEY_LENGTH = 256;

/** HKDF hash. */
export const MESSAGE_SEAL_HKDF_HASH = 'SHA-256';
