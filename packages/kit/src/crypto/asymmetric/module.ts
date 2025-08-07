/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AsymmetricCryptoAlgorithmName } from './constants';
import type { AsymmetricAlgorithmParams } from './types';

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
}
