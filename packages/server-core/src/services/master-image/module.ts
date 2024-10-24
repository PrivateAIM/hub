/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Cache } from '@privateaim/server-kit';
import { useCache } from '@privateaim/server-kit';

export class MasterImageService {
    protected cache : Cache;

    protected cacheKey : string;

    constructor() {
        this.cache = useCache();
        this.cacheKey = 'master-images-synchronizing';
    }

    async isSynchronizing() {
        const output = await this.cache.get(this.cacheKey);

        return !!output;
    }

    async setSynchronization(state: boolean) {
        if (state) {
            await this.cache.set(this.cacheKey, true, {
                ttl: 1000 * 60 * 15,
            });
        } else {
            await this.cache.drop(this.cacheKey);
        }
    }
}
