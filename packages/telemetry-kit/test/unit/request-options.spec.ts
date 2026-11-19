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
import { APIClient, LogChannel, LogLevel } from '../../src';
import { createFakeClient } from '../../src/testing';

type ArgsBuilder = (options: APIRequestOptions) => unknown[];

const ID = '00000000-0000-4000-8000-000000000000';

const METHODS : Record<string, Record<string, ArgsBuilder>> = {
    event: {
        getMany: (o) => [undefined, o],
        getOne: (o) => [ID, undefined, o],
        create: (o) => [{}, o],
        delete: (o) => [ID, o],
    },
    log: {
        getMany: (o) => [undefined, o],
        deleteMany: (o) => [undefined, o],
        create: (o) => [{
            message: 'hello',
            level: LogLevel.INFORMATIONAL,
            channel: LogChannel.SYSTEM,
        }, o],
    },
};

/**
 * hapic's api configuration surface sends no request.
 */
const IGNORED = new Set(['setClient', 'setOptions', 'setOption', 'withBaseURL']);

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

function createClient(transport: MemoryTransport) : APIClient {
    return new APIClient({
        baseURL: 'http://telemetry.test',
        transport,
    });
}

function listMethods(input: object) : string[] {
    const output = new Set<string>();

    let prototype = Object.getPrototypeOf(input);

    while (prototype && prototype !== Object.prototype) {
        for (const name of Object.getOwnPropertyNames(prototype)) {
            const descriptor = Object.getOwnPropertyDescriptor(prototype, name);

            if (name !== 'constructor' && descriptor && typeof descriptor.value === 'function') {
                output.add(name);
            }
        }

        prototype = Object.getPrototypeOf(prototype);
    }

    return [...output].sort();
}

type Case = {
    name: string,
    api: string,
    method: string,
    args: ArgsBuilder,
};

function buildCases() : Case[] {
    const client = createClient(new MemoryTransport());

    const output : Case[] = [];

    for (const [api, table] of Object.entries(METHODS)) {
        const instance = (client as unknown as Record<string, object>)[api];

        for (const method of listMethods(instance)) {
            if (IGNORED.has(method)) {
                continue;
            }

            const args = table[method];

            if (!args) {
                throw new Error(`${api}.${method} has no entry in the request options table.`);
            }

            output.push({
                name: `${api}.${method}`,
                api,
                method,
                args,
            });
        }
    }

    return output;
}

function invoke(client: APIClient, entry: Case, options: APIRequestOptions) : Promise<unknown> {
    const target = (client as unknown as Record<string, unknown>)[entry.api] as
        Record<string, (...args: unknown[]) => Promise<unknown>>;

    return target[entry.method](...entry.args(options));
}

const CASES = buildCases();

describe('per-call request options', () => {
    it.each(CASES.map((entry) => [entry.name, entry] as const))(
        '%s should abort with the caller signal',
        async (_name, entry) => {
            const transport = createStalledTransport();
            const client = createClient(transport);

            const controller = new AbortController();

            const promise = invoke(client, entry, { signal: controller.signal })
                .catch((e: unknown) => e);

            await new Promise((resolve) => {
                setTimeout(resolve, 0);
            });

            controller.abort();

            const error = await promise;

            expect(isClientError(error)).toBe(true);
            expect(isClientError(error) ? error.code : undefined).toEqual(ErrorCode.CONNECTION_ABORTED);

            expect(transport.requests).toHaveLength(1);

            const { signal } = transport.requests[0];

            expect(signal && signal.aborted).toBe(true);
        },
    );

    it.each(CASES.map((entry) => [entry.name, entry] as const))(
        '%s should time out with the per-call timeout',
        async (_name, entry) => {
            const client = createClient(createStalledTransport());

            const error = await invoke(client, entry, { timeout: 10 })
                .catch((e: unknown) => e);

            expect(isClientErrorDueTimeout(error)).toBe(true);
        },
    );

    it('should record the options with the request on the fake client', async () => {
        const client = createFakeClient();

        const controller = new AbortController();

        await client.log.getMany(undefined, { signal: controller.signal, timeout: 1000 });
        await client.event.getMany();

        expect(client.requests[0].options).toEqual({ signal: controller.signal, timeout: 1000 });
        expect(client.requests[1].options).toEqual({});
    });
});
