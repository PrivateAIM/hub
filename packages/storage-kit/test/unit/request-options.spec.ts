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
import type { APIRequestOptions, IStorageClient } from '../../src';
import { APIClient } from '../../src';
import { createFakeClient } from '../../src/testing';
import { SlowBodyTransport } from './fakes/slow-body-transport';

type ArgsBuilder = (options: APIRequestOptions) => unknown[];

type MethodTable = Record<string, ArgsBuilder>;

const ID = '00000000-0000-4000-8000-000000000000';

const ENTITY_METHODS : MethodTable = {
    getMany: (o) => [undefined, o],
    getOne: (o) => [ID, undefined, o],
    create: (o) => [{}, o],
    update: (o) => [ID, {}, o],
    delete: (o) => [ID, o],
    stream: (o) => [ID, o],
};

const METHODS : Record<string, MethodTable> = {
    bucket: {
        ...ENTITY_METHODS,
        clear: (o) => [ID, o],
        upload: (o) => [ID, new FormData(), o],
    },
    bucketFile: ENTITY_METHODS,
};

/**
 * Methods that send no request: hapic's api configuration surface and the
 * path/url builders.
 */
const IGNORED = new Set([
    'setClient',
    'setOptions',
    'setOption',
    'withBaseURL',
    'resolveURL',
    'getStreamPath',
    'getStreamURL',
]);

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
        baseURL: 'http://storage.test',
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

function invoke(client: IStorageClient, entry: Case, options: APIRequestOptions) : Promise<unknown> {
    const target = (client as unknown as Record<string, unknown>)[entry.api] as
        Record<string, (...args: unknown[]) => Promise<unknown>>;

    return target[entry.method](...entry.args(options));
}

const CASES = buildCases();

describe('per-call request options', () => {
    it('should cover the stream and upload methods', () => {
        const names = CASES.map((entry) => entry.name);

        expect(names).toContain('bucket.stream');
        expect(names).toContain('bucket.upload');
        expect(names).toContain('bucketFile.stream');
    });

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

    it('should pass the signal through a scoped client', async () => {
        const transport = createStalledTransport();
        const scoped = createClient(transport).withAuthorization(async () => 'cap-token');

        const controller = new AbortController();

        const promise = scoped.bucket.getOne(ID, undefined, { signal: controller.signal })
            .catch((e: unknown) => e);

        await new Promise((resolve) => {
            setTimeout(resolve, 0);
        });

        controller.abort();

        const error = await promise;

        expect(isClientError(error) ? error.code : undefined).toEqual(ErrorCode.CONNECTION_ABORTED);
    });

    it('should let a per-call timeout override the client timeout', async () => {
        const client = new APIClient({
            baseURL: 'http://storage.test/',
            timeout: 5,
            transport: new SlowBodyTransport(30),
        });

        const { meta } = await client.bucket.getMany(undefined, { timeout: 1000 });

        expect(meta.total).toEqual(0);
    });

    it('should record the options with the request on the fake client', async () => {
        const client = createFakeClient();

        const controller = new AbortController();

        await client.bucket.getMany(undefined, { signal: controller.signal, timeout: 1000 });
        await client.bucket.getOne(ID);
        await client.bucketFile.stream(ID);

        expect(client.requests[0].options).toEqual({ signal: controller.signal, timeout: 1000 });
        expect(client.requests[1].options).toEqual({});
        expect(client.requests[2].options).toEqual({ timeout: 0 });
    });
});
