/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { CollectionResourceFetcher } from './types-base';

const PAGE_SIZE = 50;

/**
 * Fetch a resource collection exhaustively, following pagination until
 * every record is retrieved. The server caps the page size (maxLimit),
 * so a single getMany call never guarantees the full collection.
 *
 * @param fetch
 */
export async function getManyAll<T>(fetch: CollectionResourceFetcher<T>): Promise<T[]> {
    const items : T[] = [];

    let offset = 0;
    let total = 1;

    while (offset < total) {
        const { data, meta } = await fetch({ limit: PAGE_SIZE, offset });

        items.push(...data);

        if (data.length === 0) {
            break;
        }

        offset += data.length;
        total = meta.total;
    }

    return items;
}
