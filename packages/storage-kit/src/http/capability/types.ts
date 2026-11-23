/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type StorageCapabilityTokenMintInput = {
    cap: string[],
    /** seconds */
    lifetime?: number
};

export type StorageCapabilityTokenMintOutput = {
    token: string,
    /** ISO date string */
    expiresAt: string
};

export type StorageCapabilityTokenMinter = (
    input: StorageCapabilityTokenMintInput,
) => Promise<StorageCapabilityTokenMintOutput>;

export interface IStorageCapabilityTokenProvider {
    getToken(cap: string[]): Promise<string>;

    /**
     * Drop the cached token of one cap set, or every cached token.
     */
    invalidate(cap?: string[]): void;
}

export type StorageCapabilityTokenProviderContext = {
    mint: StorageCapabilityTokenMinter,
    /** seconds before expiry from which a cached token counts as stale (default 60) */
    refreshMargin?: number,
    /** epoch milliseconds (default Date.now) */
    now?: () => number
};
