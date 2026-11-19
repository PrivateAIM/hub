/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TransportRequest } from 'hapic';
import {
    ErrorCode,
    MemoryTransport,
    isClientError,
    isClientErrorDueTimeout,
} from 'hapic';
import { describe, expect, it } from 'vitest';
import type { APIRequestOptions } from '../../src';
import { Client } from '../../src';
import { createFakeClient } from '../../src/testing';

type Case = [string, (client: Client, options: APIRequestOptions) => Promise<unknown>];

const ID = '00000000-0000-4000-8000-000000000000';

const CASES : Case[] = [
    ['send', (client, o) => client.message.send({ recipients: [], data: {} }, o)],
    ['ack', (client, o) => client.message.ack({ ids: [ID] }, o)],
];

function createStalledTransport() : MemoryTransport {
    return new MemoryTransport({
        fetch: (request: TransportRequest) => new Promise((resolve, reject) => {
            const { signal } = request;

            if (!signal) {
                resolve({ status: 200, body: {} });

                return;
            }

            if (signal.aborted) {
                reject(signal.reason);

                return;
            }

            signal.addEventListener('abort', () => reject(signal.reason), { once: true });
        }),
    });
}

function createClient(transport: MemoryTransport) : Client {
    return new Client({
        baseURL: 'http://messenger.test',
        transport,
    });
}

describe('per-call request options', () => {
    it.each(CASES)('%s should abort with the caller signal', async (_name, call) => {
        const transport = createStalledTransport();

        const controller = new AbortController();

        const promise = call(createClient(transport), { signal: controller.signal })
            .catch((e: unknown) => e);

        await new Promise((resolve) => {
            setTimeout(resolve, 0);
        });

        controller.abort();

        const error = await promise;

        expect(isClientError(error) ? error.code : undefined).toEqual(ErrorCode.CONNECTION_ABORTED);

        expect(transport.requests).toHaveLength(1);

        const { signal } = transport.requests[0];

        expect(signal && signal.aborted).toBe(true);
    });

    it.each(CASES)('%s should time out with the per-call timeout', async (_name, call) => {
        const error = await call(createClient(createStalledTransport()), { timeout: 10 })
            .catch((e: unknown) => e);

        expect(isClientErrorDueTimeout(error)).toBe(true);
    });

    it('subscribe should time out with the per-call timeout', async () => {
        const client = createClient(createStalledTransport());

        const iterator = client.message.subscribe({ timeout: 10 })[Symbol.asyncIterator]();

        const error = await iterator.next().catch((e: unknown) => e);

        expect(isClientErrorDueTimeout(error)).toBe(true);
    });

    it('should record the options with the request on the fake client', async () => {
        const client = createFakeClient();

        const controller = new AbortController();

        await client.message.ack({ ids: [ID] }, { signal: controller.signal, timeout: 1000 });
        await client.message.ack({ ids: [ID] });

        expect(client.requests[0].options).toEqual({ signal: controller.signal, timeout: 1000 });
        expect(client.requests[1].options).toEqual({});
    });
});
