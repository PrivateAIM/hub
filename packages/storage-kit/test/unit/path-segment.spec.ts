/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PATH_SEGMENT_INVALID_ERROR_CODE } from '@authup/core-http-kit';
import { describe, expect, it } from 'vitest';
import { createFakeClient } from '../../src/testing';

function createClient() {
    return createFakeClient({
        handlers: {
            'GET /buckets': () => ({ data: [], meta: { total: 0 } }),
            'GET /buckets/:id': (req) => ({ data: { id: req.params.id }, meta: {} }),
            'GET /bucket-files': () => ({ data: [], meta: { total: 0 } }),
        },
    });
}

describe('path segment encoding', () => {
    it.each(['', '.', '..'])('should refuse the id %j before any request is sent', async (id) => {
        const client = createClient();

        await expect(client.bucket.getOne(id)).rejects.toMatchObject({ code: PATH_SEGMENT_INVALID_ERROR_CODE });
        await expect(client.bucketFile.getOne(id)).rejects.toMatchObject({ code: PATH_SEGMENT_INVALID_ERROR_CODE });
        expect(client.requests).toHaveLength(0);
    });

    it('should keep an id with reserved characters in one segment', async () => {
        const client = createClient();

        await client.bucket.getOne('a/b?c#d');

        expect(client.requests).toHaveLength(1);
        expect(client.requests[0].url).toContain('/buckets/a%2Fb%3Fc%23d');
        expect(client.requests[0].params).toEqual({ id: 'a%2Fb%3Fc%23d' });
    });
});
