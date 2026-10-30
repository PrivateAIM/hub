/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import crypto from 'node:crypto';

export function decryptSymmetric(key: Buffer, data: Buffer, ivLength = 16): Buffer {
    const iv = data.slice(0, ivLength);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    return Buffer.concat([decipher.update(data.slice(ivLength)), decipher.final()]);
}

export function encryptSymmetric(key: Buffer, iv: Buffer, data: string | Buffer) : Buffer {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    return Buffer.concat([iv, cipher.update(data), cipher.final()]);
}
