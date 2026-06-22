/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    MESSAGE_SEAL_HKDF_HASH,
    MESSAGE_SEAL_IV_LENGTH,
    MESSAGE_SEAL_KEY_LENGTH,
    MESSAGE_SEAL_SALT_LENGTH,
} from './constants';
import type { MessageSealInput, OpenMessageContext, SealMessageContext } from './types';

function toBytes(input: MessageSealInput): Uint8Array {
    if (typeof input === 'string') {
        return new TextEncoder().encode(input);
    }
    if (ArrayBuffer.isView(input)) {
        return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
    }
    return new Uint8Array(input);
}

function bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

function curveBitLength(key: CryptoKey): number {
    const named = (key.algorithm as EcKeyAlgorithm).namedCurve;
    switch (named) {
        case 'P-384':
            return 384;
        case 'P-521':
            return 528;
        default:
            return 256;
    }
}

/**
 * Derive a fresh AES-GCM key from the ECDH shared secret via HKDF with a
 * per-message salt (and optional context `info`). Deriving per message — rather
 * than reusing a static ECDH-derived key — avoids AES-GCM nonce reuse across the
 * many messages exchanged between a fixed pair of keys.
 */
async function deriveMessageKey(
    privateKey: CryptoKey,
    publicKey: CryptoKey,
    salt: Uint8Array,
    info: Uint8Array,
    usage: KeyUsage,
): Promise<CryptoKey> {
    const sharedSecret = await crypto.subtle.deriveBits(
        { name: 'ECDH', public: publicKey },
        privateKey,
        curveBitLength(privateKey),
    );

    const hkdfKey = await crypto.subtle.importKey(
        'raw',
        sharedSecret,
        'HKDF',
        false,
        ['deriveKey'],
    );

    return crypto.subtle.deriveKey(
        {
            name: 'HKDF', 
            hash: MESSAGE_SEAL_HKDF_HASH, 
            salt, 
            info,
        },
        hkdfKey,
        { name: 'AES-GCM', length: MESSAGE_SEAL_KEY_LENGTH },
        false,
        [usage],
    );
}

/**
 * Seal a message for a recipient: ECDH → per-message HKDF → AES-256-GCM.
 *
 * Returns `base64( salt ‖ iv ‖ ciphertext‖tag )`. The hub stores this opaque
 * blob and never decrypts it.
 */
export async function sealMessage(ctx: SealMessageContext): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(MESSAGE_SEAL_SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(MESSAGE_SEAL_IV_LENGTH));
    const info = typeof ctx.info === 'undefined' ? new Uint8Array(0) : toBytes(ctx.info);

    const key = await deriveMessageKey(ctx.privateKey, ctx.publicKey, salt, info, 'encrypt');
    const ciphertext = new Uint8Array(
        await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, toBytes(ctx.data)),
    );

    const frame = new Uint8Array(salt.length + iv.length + ciphertext.length);
    frame.set(salt, 0);
    frame.set(iv, salt.length);
    frame.set(ciphertext, salt.length + iv.length);

    return bytesToBase64(frame);
}

/**
 * Open a sealed message — the inverse of `sealMessage`. Throws if the frame is
 * malformed or authentication fails.
 */
export async function openMessage(ctx: OpenMessageContext): Promise<Uint8Array> {
    const frame = base64ToBytes(ctx.payload);
    if (frame.length < MESSAGE_SEAL_SALT_LENGTH + MESSAGE_SEAL_IV_LENGTH) {
        throw new Error('The sealed message frame is malformed.');
    }

    const salt = frame.subarray(0, MESSAGE_SEAL_SALT_LENGTH);
    const iv = frame.subarray(MESSAGE_SEAL_SALT_LENGTH, MESSAGE_SEAL_SALT_LENGTH + MESSAGE_SEAL_IV_LENGTH);
    const ciphertext = frame.subarray(MESSAGE_SEAL_SALT_LENGTH + MESSAGE_SEAL_IV_LENGTH);
    const info = typeof ctx.info === 'undefined' ? new Uint8Array(0) : toBytes(ctx.info);

    const key = await deriveMessageKey(ctx.privateKey, ctx.publicKey, salt, info, 'decrypt');
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);

    return new Uint8Array(plaintext);
}
