/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ITaggedCache } from '@rapiq/cache';
import type { Client } from 'redis-extension';

export type TaggedCacheCreateInput = {
    /**
     * The service client; the cache runs on a duplicate of it and never closes it.
     * Without one, the cache keeps its entries in process memory.
     */
    redis?: Client,
    /**
     * The per-service namespace (e.g. `hub-core`), appended to the client's `keyPrefix`.
     */
    prefix: string,
    onError: (error: unknown) => void,
};

export type TaggedCacheClient = {
    client: Client,
    prefix: string,
};

export type TaggedCacheCreateResult = {
    cache: ITaggedCache,
    /**
     * Connects the client and settles once it is ready, has ended or the connect timeout ran out; never rejects.
     */
    ready: () => Promise<void>,
    dispose: () => Promise<void>,
};

export type TaggedCacheModuleOptions = {
    /**
     * The per-service key prefix (e.g. `hub-core`); services sharing one Redis must differ.
     */
    prefix: string,
};
