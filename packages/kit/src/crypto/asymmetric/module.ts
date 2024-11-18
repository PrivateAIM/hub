/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AsymmetricCryptoAlgorithmName } from './constants';
import type { AsymmetricAlgorithmImportParams, AsymmetricAlgorithmParams } from './types';
import { exportAsymmetricPrivateKey, exportAsymmetricPublicKey } from './helpers';

export class CryptoAsymmetricAlgorithm {
    public readonly algorithm: AsymmetricAlgorithmParams;

    protected keyPair : CryptoKeyPair | undefined;

    constructor(algorithm: AsymmetricAlgorithmParams) {
        if (algorithm.name === AsymmetricCryptoAlgorithmName.RSA_OAEP) {
            algorithm = {
                ...algorithm,
                publicExponent: new Uint8Array([1, 0, 1]),
            };
        }

        this.algorithm = algorithm;
    }

    buildImportParams() : AsymmetricAlgorithmImportParams {
        if (this.algorithm.name === AsymmetricCryptoAlgorithmName.RSA_OAEP) {
            return {
                name: 'RSA-OAEP',
                hash: 'SHA-256',
            };
        }

        if (this.algorithm.name === AsymmetricCryptoAlgorithmName.ECDH) {
            return {
                name: 'ECDH',
                namedCurve: (this.algorithm as EcKeyGenParams).namedCurve,
                hash: 'SHA-256',
            };
        }

        throw new Error('Import params could not be created.');
    }

    async generateKeyPair() : Promise<CryptoKeyPair> {
        if (this.algorithm.name === AsymmetricCryptoAlgorithmName.RSA_OAEP) {
            this.keyPair = await crypto.subtle.generateKey(
                this.algorithm,
                true,
                ['encrypt', 'decrypt'],
            );

            return this.keyPair;
        }

        if (this.algorithm.name === AsymmetricCryptoAlgorithmName.ECDH) {
            this.keyPair = await crypto.subtle.generateKey(
                this.algorithm,
                true,
                ['deriveKey'],
            );

            return this.keyPair;
        }

        throw new Error('The algorithm is not supported for key generation.');
    }

    async useKeyPair(): Promise<CryptoKeyPair> {
        if (typeof this.keyPair !== 'undefined') {
            return this.keyPair;
        }

        return this.generateKeyPair();
    }

    async exportPublicKey(): Promise<string> {
        const keyPair = await this.useKeyPair();

        return exportAsymmetricPublicKey(keyPair.publicKey);
    }

    async exportPrivateKey(): Promise<string> {
        const keyPair = await this.useKeyPair();

        return exportAsymmetricPrivateKey(keyPair.privateKey);
    }

    async encrypt(data: Buffer, remoteKey?: CryptoKey) {
        const keyPair = await this.useKeyPair();

        if (this.algorithm.name === AsymmetricCryptoAlgorithmName.RSA_OAEP) {
            return crypto.subtle.encrypt(
                {
                    name: 'RSA-OAEP',
                },
                remoteKey || keyPair.publicKey,
                data,
            );
        }

        if (this.algorithm.name === AsymmetricCryptoAlgorithmName.ECDH) {
            if (typeof remoteKey === 'undefined') {
                throw new Error('Remote public key is required.');
            }

            const array = new Uint8Array(16);
            const iv = crypto.getRandomValues(array);
            const key = await crypto.subtle.deriveKey(
                {
                    name: 'ECDH',
                    public: remoteKey,
                },
                keyPair.privateKey,
                {
                    name: 'AES-GCM',
                    length: 256,
                },
                true,
                ['encrypt'],
            );

            const arrayBuffer = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    length: 256,
                    iv,
                },
                key,
                data,
            );

            const buffer = Buffer.from(arrayBuffer);

            return Buffer.concat([iv, buffer]);
        }

        throw new Error('Unsupported algorithm for encryption.');
    }

    async decrypt(data: Buffer, remoteKey?: CryptoKey) {
        const keyPair = await this.useKeyPair();

        if (this.algorithm.name === AsymmetricCryptoAlgorithmName.RSA_OAEP) {
            return crypto.subtle.decrypt(
                {
                    name: 'RSA-OAEP',
                },
                keyPair.privateKey,
                data,
            );
        }

        if (this.algorithm.name === AsymmetricCryptoAlgorithmName.ECDH) {
            if (typeof remoteKey === 'undefined') {
                throw new Error('Remote public key is required.');
            }

            const iv = data.slice(0, 16);

            const key = await crypto.subtle.deriveKey(
                {
                    name: 'ECDH',
                    public: remoteKey,
                },
                keyPair.privateKey,
                {
                    name: 'AES-GCM',
                    length: 256,
                },
                true,
                ['decrypt'],
            );

            return crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    length: 256,
                    iv,
                },
                key,
                data.slice(16),
            );
        }

        throw new Error('Unsupported algorithm for decryption.');
    }
}
