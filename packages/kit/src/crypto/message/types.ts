/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type MessageSealInput = ArrayBuffer | ArrayBufferView | string;

export type SealMessageContext = {
    /** the sender's ECDH private key */
    privateKey: CryptoKey,
    /** the recipient's ECDH public key */
    publicKey: CryptoKey,
    /** the plaintext to seal */
    data: MessageSealInput,
    /**
     * Optional context bound into the key derivation (HKDF `info`) — e.g.
     * `messageId + analysisId`. The opener must pass the identical value.
     */
    info?: MessageSealInput,
};

export type OpenMessageContext = {
    /** the recipient's ECDH private key */
    privateKey: CryptoKey,
    /** the sender's ECDH public key */
    publicKey: CryptoKey,
    /** the base64 frame produced by `sealMessage` */
    payload: string,
    /** the same `info` the sealer used, if any */
    info?: MessageSealInput,
};
