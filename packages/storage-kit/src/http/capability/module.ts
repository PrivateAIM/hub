/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    IStorageCapabilityTokenProvider,
    StorageCapabilityTokenMintOutput,
    StorageCapabilityTokenMinter,
    StorageCapabilityTokenProviderContext,
} from './types';

type CacheEntry = {
    /** epoch milliseconds, Infinity while the mint is in flight */
    expiresAt: number,
    promise: Promise<StorageCapabilityTokenMintOutput>
};

function buildKey(cap: string[]) : string {
    return [...cap].sort().join(' ');
}

/**
 * Caches minted capability tokens per cap set. A token is re-minted once it is
 * within `refreshMargin` seconds of its expiry; concurrent callers of one cap
 * set share the in-flight mint, and a failed mint is never cached.
 */
export class StorageCapabilityTokenProvider implements IStorageCapabilityTokenProvider {
    protected mint : StorageCapabilityTokenMinter;

    protected refreshMargin : number;

    protected now : () => number;

    protected cache = new Map<string, CacheEntry>();

    constructor(ctx: StorageCapabilityTokenProviderContext) {
        this.mint = ctx.mint;
        this.refreshMargin = ctx.refreshMargin ?? 60;
        this.now = ctx.now ?? (() => Date.now());
    }

    async getToken(cap: string[]): Promise<string> {
        const key = buildKey(cap);

        const cached = this.cache.get(key);

        if (cached && cached.expiresAt - this.refreshMargin * 1000 > this.now()) {
            return (await cached.promise).token;
        }

        const entry : CacheEntry = {
            expiresAt: Infinity,
            promise: this.mint({ cap }),
        };

        this.cache.set(key, entry);

        try {
            const output = await entry.promise;

            entry.expiresAt = new Date(output.expiresAt).getTime();

            return output.token;
        } catch (e) {
            if (this.cache.get(key) === entry) {
                this.cache.delete(key);
            }

            throw e;
        }
    }

    invalidate(cap?: string[]): void {
        if (cap) {
            this.cache.delete(buildKey(cap));

            return;
        }

        this.cache.clear();
    }
}
