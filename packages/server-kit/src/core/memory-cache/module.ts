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

export class MemoryCache<
    KEY extends string = string,
    VALUE = any,
> {
    protected options : BlockerOptions;

    protected cache : TTLCache<KEY, VALUE>;

    constructor(options: Partial<BlockerOptions> = {}) {
        this.options = {
            // 60 seconds
            ttl: 1000 * 60,
            ...options,
        };
        this.cache = new TTLCache<KEY, VALUE>();
    }

    set(id: KEY, value: VALUE, options: BlockerOptions) {
        this.cache.set(id, value, {
            ttl: options.ttl,
        });
    }

    get(id: KEY): VALUE | undefined {
        return this.cache.get(id);
    }

    del(id: KEY) : void {
        this.cache.delete(id);
    }

    has(id: KEY) : boolean {
        return this.cache.has(id);
    }
}
