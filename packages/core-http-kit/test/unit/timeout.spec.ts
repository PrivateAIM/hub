/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isClientErrorDueTimeout } from 'hapic';
import { describe, expect, it } from 'vitest';
import { Client } from '../../src';
import { SlowBodyTransport } from './fakes/slow-body-transport';

function createClient(delay: number, body?: unknown) : Client {
    return new Client({
        baseURL: 'http://core.test/',
        timeout: 5,
        transport: new SlowBodyTransport(delay, body),
    });
}

describe('client timeout', () => {
    it('should cut off a call whose body outlasts the timeout', async () => {
        const error = await createClient(200).project.getMany().catch((e: unknown) => e);

        expect(isClientErrorDueTimeout(error)).toBe(true);
    });

    it.each([
        ['streamFiles'],
        ['downloadResult'],
    ] as const)('should not cut off %s while its body is read', async (method) => {
        const stream = await createClient(30, 'archive').analysis[method]('a');

        await expect(new Response(stream).text()).resolves.toBe('"archive"');
    });
});
