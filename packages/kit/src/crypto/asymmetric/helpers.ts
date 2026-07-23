/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AsymmetricAlgorithmImportParams } from './types';

function arrayBufferToBase64(arrayBuffer: ArrayBuffer): string {
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(arrayBuffer))));
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

function stripPem(pem: string): string {
    return pem
        .replace(/-----BEGIN [^-]+-----/, '')
        .replace(/-----END [^-]+-----/, '')
        .replace(/\s+/g, '');
}

export async function exportAsymmetricPublicKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey(
        'spki',
        key,
    );

    return `-----BEGIN PUBLIC KEY-----\n${arrayBufferToBase64(exported)}\n-----END PUBLIC KEY-----`;
}

export async function exportAsymmetricPrivateKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey(
        'pkcs8',
        key,
    );

    return `-----BEGIN PRIVATE KEY-----\n${arrayBufferToBase64(exported)}\n-----END PRIVATE KEY-----`;
}

/**
 * Import a SubjectPublicKeyInfo (SPKI) PEM public key. For ECDH keys leave
 * `usages` empty (the private key is the one that derives).
 */
export async function importAsymmetricPublicKey(
    pem: string,
    algorithm: AsymmetricAlgorithmImportParams,
    usages: KeyUsage[] = [],
): Promise<CryptoKey> {
    return crypto.subtle.importKey(
        'spki',
        base64ToArrayBuffer(stripPem(pem)),
        algorithm,
        true,
        usages,
    );
}

/**
 * Import a PKCS#8 PEM private key. Defaults to the ECDH derive usages.
 */
export async function importAsymmetricPrivateKey(
    pem: string,
    algorithm: AsymmetricAlgorithmImportParams,
    usages: KeyUsage[] = ['deriveBits', 'deriveKey'],
    extractable = false,
): Promise<CryptoKey> {
    return crypto.subtle.importKey(
        'pkcs8',
        base64ToArrayBuffer(stripPem(pem)),
        algorithm,
        extractable,
        usages,
    );
}
