/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AsymmetricAlgorithmImportParams } from './types';

function arrayBufferToBase64(arrayBuffer: ArrayBuffer): string {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
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

export async function importAsymmetricPublicKey(
    pem: string,
    params: AsymmetricAlgorithmImportParams,
): Promise<CryptoKey> {
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
    const buffer = Buffer.from(pemContents, 'base64');

    if (params.name === 'ECDH') {
        return crypto.subtle.importKey(
            'spki',
            buffer,
            params,
            true,
            ['deriveKey'],
        );
    }

    return crypto.subtle.importKey(
        'spki',
        buffer,
        params,
        true,
        ['encrypt'],
    );
}
