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
            'GET /projects': () => ({ data: [], meta: { total: 0 } }),
            'GET /projects/:id': (req) => ({ data: { id: req.params.id }, meta: {} }),
            'DELETE /projects': () => ({ data: [], meta: {} }),
        },
    });
}

describe('path segment encoding', () => {
    it.each(['', '.', '..'])('should refuse the id %j before any request is sent', async (id) => {
        const client = createClient();

        await expect(client.project.getOne(id)).rejects.toMatchObject({ code: PATH_SEGMENT_INVALID_ERROR_CODE });
        await expect(client.project.delete(id)).rejects.toMatchObject({ code: PATH_SEGMENT_INVALID_ERROR_CODE });
        expect(client.requests).toHaveLength(0);
    });

    it('should keep an id with reserved characters in one segment', async () => {
        const client = createClient();

        await client.project.getOne('a/b?c#d');

        expect(client.requests).toHaveLength(1);
        expect(client.requests[0].url).toContain('/projects/a%2Fb%3Fc%23d');
        expect(client.requests[0].params).toEqual({ id: 'a%2Fb%3Fc%23d' });
    });

    it('should encode the id of a nested path', () => {
        const client = createClient();

        expect(client.analysis.getResultDownloadPath('../x')).toBe('analyses/..%2Fx/result/download');
    });
});
