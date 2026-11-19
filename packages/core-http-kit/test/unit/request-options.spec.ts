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
import { SlowBodyTransport } from './fakes/slow-body-transport';

type ArgsBuilder = (options: APIRequestOptions) => unknown[];

type MethodTable = Record<string, ArgsBuilder>;

const ID = '00000000-0000-4000-8000-000000000000';

/**
 * The argument lists of the CRUD surface the entity APIs share.
 */
const ENTITY_METHODS : MethodTable = {
    getMany: (o) => [undefined, o],
    getOne: (o) => [ID, undefined, o],
    create: (o) => [{}, o],
    update: (o) => [ID, {}, o],
    delete: (o) => [ID, o],
};

/**
 * Methods outside {@link ENTITY_METHODS}, or with a different argument list,
 * per sub-API. An entry here wins over the shared one.
 */
const METHODS : Record<string, MethodTable> = {
    analysis: {
        runCommand: (o) => [ID, 'spinUp', {}, o],
        createStorageToken: (o) => [ID, { cap: [] }, o],
        streamFiles: (o) => [ID, o],
        downloadResult: (o) => [ID, o],
    },
    analysisLog: { delete: (o) => [{}, o] },
    analysisNodeLog: { delete: (o) => [{}, o] },
    masterImage: { runCommand: (o) => ['sync', {}, o] },
    node: {
        runCommand: (o) => [ID, 'task', {}, o],
        getClientCredentials: (o) => [ID, o],
        setClientCredentials: (o) => [ID, undefined, o],
        getRegistryCredentials: (o) => [ID, o],
    },
    service: {
        runCommand: (o) => ['registry', 'setup', undefined, o],
        runRegistryCommand: (o) => ['setup', { id: ID }, o],
    },
};

/**
 * Methods that send no request, each with the reason.
 */
const IGNORED : Record<string, Record<string, string>> = {
    analysis: {
        getFilesDownloadPath: 'builds a path, sends nothing',
        getResultDownloadPath: 'builds a path, sends nothing',
        getFileDownloadURL: 'builds a url, sends nothing',
        getResultDownloadURL: 'builds a url, sends nothing',
    },
};

/**
 * The configuration surface of hapic's api base class.
 */
const IGNORED_EVERYWHERE = new Set(['setClient', 'setOptions', 'setOption', 'withBaseURL']);

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
        baseURL: 'http://core.test',
        transport,
    });
}

function listMethods(input: object) : string[] {
    const output = new Set<string>();

    let prototype = Object.getPrototypeOf(input);

    while (prototype && prototype !== Object.prototype) {
        const names = Object.getOwnPropertyNames(prototype);

        for (const name of names) {
            const descriptor = Object.getOwnPropertyDescriptor(prototype, name);

            if (
                name !== 'constructor' &&
                descriptor &&
                typeof descriptor.value === 'function'
            ) {
                output.add(name);
            }
        }

        prototype = Object.getPrototypeOf(prototype);
    }

    return [...output].sort();
}

function listSubAPIs(client: Client) : string[] {
    return Object.keys(client)
        .filter((key) => {
            const value = (client as unknown as Record<string, unknown>)[key];

            return !!value &&
                typeof value === 'object' &&
                (value as { client?: unknown }).client === client;
        })
        .sort();
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

    for (const api of listSubAPIs(client)) {
        const instance = (client as unknown as Record<string, object>)[api];

        for (const method of listMethods(instance)) {
            if (IGNORED_EVERYWHERE.has(method) || (IGNORED[api] && IGNORED[api][method])) {
                continue;
            }

            const args = (METHODS[api] && METHODS[api][method]) || ENTITY_METHODS[method];

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

function invoke(client: Client, entry: Case, options: APIRequestOptions) : Promise<unknown> {
    const target = (client as unknown as Record<string, unknown>)[entry.api] as
        Record<string, (...args: unknown[]) => Promise<unknown>>;

    return target[entry.method](...entry.args(options));
}

const CASES = buildCases();

describe('per-call request options', () => {
    it('should cover every sub-api', () => {
        const covered = new Set(CASES.map((entry) => entry.api));

        expect([...covered].sort()).toEqual(listSubAPIs(createClient(new MemoryTransport())));
        expect(CASES.map((entry) => entry.name)).toContain('analysis.streamFiles');
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

    it('should let a per-call timeout override the client timeout', async () => {
        const client = new Client({
            baseURL: 'http://core.test/',
            timeout: 5,
            transport: new SlowBodyTransport(30),
        });

        const { meta } = await client.project.getMany(undefined, { timeout: 1000 });

        expect(meta.total).toEqual(0);
    });

    it('should record the options with the request on the fake client', async () => {
        const client = createFakeClient();

        const controller = new AbortController();

        await client.project.getMany(undefined, { signal: controller.signal, timeout: 1000 });
        await client.project.getOne(ID);
        await client.analysis.streamFiles(ID);

        expect(client.requests[0].options).toEqual({ signal: controller.signal, timeout: 1000 });
        expect(client.requests[1].options).toEqual({});
        expect(client.requests[2].options).toEqual({ timeout: 0 });
    });
});
