/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import crypto from 'node:crypto';
import {
    createSignature,
    decryptSymmetric,
    encryptSymmetric,
    generateRSAKeyPair,
    verifySignature,
} from '../../src/core';

describe('src/core/crypto', () => {
    it('should create & verify signature', async () => {
        const { privateKey: key } = await generateRSAKeyPair();

        const data = crypto.randomBytes(32);
        const signature = createSignature({ data, key });

        const verified = verifySignature({
            data, 
            key, 
            signature, 
        });

        expect(verified).toBeTruthy();
    });

    it('should asymmetric encrypt & decrypt symmetric key', async () => {
        const keyPair = await generateRSAKeyPair();

        const symmetricKey = crypto.randomBytes(32);

        const symmetricKeyEncrypted = crypto.publicEncrypt(keyPair.publicKey, symmetricKey);

        const symmetricKeyDecrypted = crypto.privateDecrypt(keyPair.privateKey, symmetricKeyEncrypted);

        expect(symmetricKeyDecrypted).toEqual(symmetricKey);
    });

    it.each([0, 1, 15, 16, 17, 128, 129])('should symmetric encrypt & decrypt a %i-byte buffer', (length) => {
        const symmetricKey = crypto.randomBytes(32);
        const symmetricKeyIv = crypto.randomBytes(16);

        const buff = crypto.randomBytes(length);

        const symmetricEncrypted = encryptSymmetric(symmetricKey, symmetricKeyIv, buff);
        const symmetricDecrypted = decryptSymmetric(symmetricKey, symmetricEncrypted);

        expect(symmetricEncrypted.length).toBe(16 + (Math.floor(length / 16) + 1) * 16);
        expect(symmetricDecrypted).toEqual(buff);
    });

    it('should throw synchronously for invalid padding', () => {
        expect(() => decryptSymmetric(Buffer.alloc(32), Buffer.alloc(16))).toThrow();
    });
});
