/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import type { CollectionResourcePage, CollectionResourceResponse } from '../../src/domains/types-base';
import { getManyAll } from '../../src/domains/helpers';

type Item = { id: number };

class FakeCollectionAPI {
    protected items: Item[];

    protected maxLimit: number;

    public pages: CollectionResourcePage[] = [];

    constructor(total: number, maxLimit: number) {
        this.items = Array.from({ length: total }, (_, i) => ({ id: i }));
        this.maxLimit = maxLimit;
    }

    async getMany(page: CollectionResourcePage): Promise<CollectionResourceResponse<Item>> {
        this.pages.push(page);

        const limit = Math.min(page.limit, this.maxLimit);
        const data = this.items.slice(page.offset, page.offset + limit);

        return {
            data,
            meta: {
                limit,
                offset: page.offset,
                total: this.items.length,
            },
        };
    }
}

describe('getManyAll', () => {
    it('should collect all records across multiple pages', async () => {
        const api = new FakeCollectionAPI(120, 50);

        const items = await getManyAll((page) => api.getMany(page));

        expect(items).toHaveLength(120);
        expect(items.map((item) => item.id)).toEqual(Array.from({ length: 120 }, (_, i) => i));
        expect(api.pages).toHaveLength(3);
    });

    it('should collect a collection smaller than one page', async () => {
        const api = new FakeCollectionAPI(3, 50);

        const items = await getManyAll((page) => api.getMany(page));

        expect(items).toHaveLength(3);
        expect(api.pages).toHaveLength(1);
    });

    it('should handle an empty collection', async () => {
        const api = new FakeCollectionAPI(0, 50);

        const items = await getManyAll((page) => api.getMany(page));

        expect(items).toHaveLength(0);
        expect(api.pages).toHaveLength(1);
    });

    it('should respect a server page cap smaller than the requested limit', async () => {
        const api = new FakeCollectionAPI(25, 10);

        const items = await getManyAll((page) => api.getMany(page));

        expect(items).toHaveLength(25);
        expect(api.pages).toHaveLength(3);
    });

    it('should terminate when the server returns an exact page boundary', async () => {
        const api = new FakeCollectionAPI(100, 50);

        const items = await getManyAll((page) => api.getMany(page));

        expect(items).toHaveLength(100);
        expect(api.pages).toHaveLength(2);
    });
});
