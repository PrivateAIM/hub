/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { SymmetricAlgorithmParams } from './types';

export class CryptoSymmetricAlgorithm {
    protected algorithm : SymmetricAlgorithmParams;

    constructor(algorithm: SymmetricAlgorithmParams) {
        this.algorithm = algorithm;
    }

    async generateKey() : Promise<CryptoKey> {
        return crypto.subtle.generateKey(
            {
                name: this.algorithm.name,
                length: 256,
            },
            true,
            ['encrypt', 'decrypt'],
        );
    }

    async importKey(buffer: Buffer | ArrayBuffer) : Promise<CryptoKey> {
        return crypto.subtle.importKey(
            'raw',
            buffer,
            {
                name: this.algorithm.name,
                length: 256,
            },
            true,
            ['encrypt', 'decrypt'],
        );
    }

    async encrypt(key: CryptoKey, iv: Buffer, data: Buffer) : Promise<Buffer> {
        const arrayBuffer = await crypto.subtle.encrypt(
            {
                name: this.algorithm.name,
                length: 256,
                iv,
            },
            key,
            data,
        );

        const buffer = Buffer.from(arrayBuffer);

        return Buffer.concat([iv, buffer]);
    }

    async decrypt(key: CryptoKey, data: Buffer) : Promise<Buffer> {
        const iv = data.slice(0, 16);
        const arrayBuffer = await crypto.subtle.decrypt(
            {
                name: this.algorithm.name,
                length: 256,
                iv,
            },
            key,
            data.slice(16),
        );

        return Buffer.from(arrayBuffer);
    }
}
