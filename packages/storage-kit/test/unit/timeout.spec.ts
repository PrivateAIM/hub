/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isClientErrorDueTimeout } from 'hapic';
import { describe, expect, it } from 'vitest';
import { APIClient } from '../../src';
import { SlowBodyTransport } from './fakes/slow-body-transport';

function createClient(delay: number, body?: unknown) : APIClient {
    return new APIClient({
        baseURL: 'http://storage.test/',
        timeout: 5,
        transport: new SlowBodyTransport(delay, body),
    });
}

describe('client timeout', () => {
    it('should cut off a call whose body outlasts the timeout', async () => {
        const error = await createClient(200).bucket.getMany().catch((e: unknown) => e);

        expect(isClientErrorDueTimeout(error)).toBe(true);
    });

    it('should keep the timeout and transport on a scoped client', async () => {
        const scoped = createClient(200).withAuthorization(async () => 'cap-token');
        const error = await scoped.bucket.getMany().catch((e: unknown) => e);

        expect(isClientErrorDueTimeout(error)).toBe(true);
    });

    it('should not cut off a bucket stream while its body is read', async () => {
        const stream = await createClient(30, 'archive').bucket.stream('a');

        await expect(new Response(stream).text()).resolves.toBe('"archive"');
    });

    it('should not cut off a bucket file stream while its body is read', async () => {
        const stream = await createClient(30, 'file').bucketFile.stream('a');

        await expect(new Response(stream).text()).resolves.toBe('"file"');
    });

    it('should not cut off an upload', async () => {
        const response = await createClient(30).bucket.upload('a', new FormData());

        expect(response).toEqual({ data: [], meta: { total: 0 } });
    });
});
