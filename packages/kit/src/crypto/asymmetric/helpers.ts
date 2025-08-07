/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

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
