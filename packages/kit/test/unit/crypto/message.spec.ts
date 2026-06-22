/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import {
    exportAsymmetricPrivateKey,
    exportAsymmetricPublicKey,
    importAsymmetricPrivateKey,
    importAsymmetricPublicKey,
    openMessage,
    sealMessage,
} from '../../../src';

const ECDH_PARAMS = { name: 'ECDH', namedCurve: 'P-256' } as const;

async function generateEcdhPair() {
    return crypto.subtle.generateKey(ECDH_PARAMS, true, ['deriveBits', 'deriveKey']);
}

function decode(bytes: Uint8Array): string {
    return new TextDecoder().decode(bytes);
}

describe('crypto/message', () => {
    it('should seal and open a round-trip between two parties', async () => {
        const sender = await generateEcdhPair();
        const recipient = await generateEcdhPair();

        const payload = await sealMessage({
            privateKey: sender.privateKey,
            publicKey: recipient.publicKey,
            data: 'hello node',
        });

        const opened = await openMessage({
            privateKey: recipient.privateKey,
            publicKey: sender.publicKey,
            payload,
        });

        expect(decode(opened)).toBe('hello node');
    });

    it('should produce a different frame each time (fresh per-message salt + iv)', async () => {
        const sender = await generateEcdhPair();
        const recipient = await generateEcdhPair();

        const a = await sealMessage({
            privateKey: sender.privateKey, 
            publicKey: recipient.publicKey, 
            data: 'same', 
        });
        const b = await sealMessage({
            privateKey: sender.privateKey, 
            publicKey: recipient.publicKey, 
            data: 'same', 
        });

        expect(a).not.toBe(b);
    });

    it('should bind the info context (mismatched info fails to open)', async () => {
        const sender = await generateEcdhPair();
        const recipient = await generateEcdhPair();

        const payload = await sealMessage({
            privateKey: sender.privateKey,
            publicKey: recipient.publicKey,
            data: 'scoped',
            info: 'message-1:analysis-1',
        });

        await expect(openMessage({
            privateKey: recipient.privateKey,
            publicKey: sender.publicKey,
            payload,
            info: 'message-1:analysis-2',
        })).rejects.toThrow();

        const opened = await openMessage({
            privateKey: recipient.privateKey,
            publicKey: sender.publicKey,
            payload,
            info: 'message-1:analysis-1',
        });
        expect(decode(opened)).toBe('scoped');
    });

    it('should reject a tampered frame', async () => {
        const sender = await generateEcdhPair();
        const recipient = await generateEcdhPair();

        const payload = await sealMessage({
            privateKey: sender.privateKey, 
            publicKey: recipient.publicKey, 
            data: 'integrity', 
        });
        const bytes = Uint8Array.from(atob(payload), (c) => c.charCodeAt(0));
        bytes[bytes.length - 1] ^= 0xff;
        const tampered = btoa(String.fromCharCode(...bytes));

        await expect(openMessage({
            privateKey: recipient.privateKey,
            publicKey: sender.publicKey,
            payload: tampered,
        })).rejects.toThrow();
    });

    it('should round-trip keys exported and re-imported from PEM', async () => {
        const sender = await generateEcdhPair();
        const recipient = await generateEcdhPair();

        const recipientPublicPem = await exportAsymmetricPublicKey(recipient.publicKey);
        const recipientPrivatePem = await exportAsymmetricPrivateKey(recipient.privateKey);
        const senderPublicPem = await exportAsymmetricPublicKey(sender.publicKey);
        const senderPrivatePem = await exportAsymmetricPrivateKey(sender.privateKey);

        const payload = await sealMessage({
            privateKey: await importAsymmetricPrivateKey(senderPrivatePem, ECDH_PARAMS),
            publicKey: await importAsymmetricPublicKey(recipientPublicPem, ECDH_PARAMS),
            data: 'pem round-trip',
        });

        const opened = await openMessage({
            privateKey: await importAsymmetricPrivateKey(recipientPrivatePem, ECDH_PARAMS),
            publicKey: await importAsymmetricPublicKey(senderPublicPem, ECDH_PARAMS),
            payload,
        });

        expect(decode(opened)).toBe('pem round-trip');
    });
});
