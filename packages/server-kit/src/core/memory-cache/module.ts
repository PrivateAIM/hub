/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import TTLCache from '@isaacs/ttlcache';

type BlockerOptions = {
    ttl: number;
};

export class MemoryCache {
    protected options : BlockerOptions;

    protected cache : TTLCache<string, string>;

    constructor(options: Partial<BlockerOptions> = {}) {
        this.options = {
            // 60 seconds
            ttl: 1000 * 60,
            ...options,
        };
        this.cache = new TTLCache<string, string>();
    }

    set(id: string, options: BlockerOptions) {
        this.cache.set(id, '', {
            ttl: options.ttl,
        });
    }

    del(id: string) : void {
        this.cache.delete(id);
    }

    has(id: string) : boolean {
        return this.cache.has(id);
    }
}
