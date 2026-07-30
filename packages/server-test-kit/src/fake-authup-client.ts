/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { fakeResponse, matchRoute } from '@privateaim/core-http-kit/testing';
import type { FakeHandler, FakeHandlerMap, FakeRequest } from '@privateaim/core-http-kit/testing';
import { AuthupClient } from '@privateaim/server-kit';
import { MemoryTransport } from 'hapic';
import type { MemoryResponseInit, TransportRequest } from 'hapic';

/**
 * The matcher, request shape and response helper are REUSED from
 * `@privateaim/core-http-kit/testing` rather than copied. That is a legal
 * downward edge — `server-test-kit` is Layer 2, `core-http-kit` is Layer 1 — and
 * unlike the four kit-level copies (storage-kit and telemetry-kit sit BELOW
 * core-http-kit, so importing it there would invert the graph) there is no
 * layering reason to duplicate here.
 *
 * The `Authup`-prefixed aliases are kept so a spec can import both this and a
 * kit's `createFakeClient` without a name collision.
 */
export type FakeAuthupRequest = FakeRequest;
export type FakeAuthupHandler = FakeHandler;
export type FakeAuthupHandlerMap = FakeHandlerMap;

export type FakeAuthupClientOptions = {
    baseURL?: string,
    handlers?: FakeAuthupHandlerMap,
    fallback?: FakeAuthupHandler
};

const defaultFallback : FakeAuthupHandler = () => ({ data: [], meta: { total: 0 } });

/**
 * Drive a non-2xx through the REAL hapic error pipeline, so the rejection is a
 * genuine `ClientError` that `isClientErrorWithStatusCode(e, 404)` recognises.
 */
export const fakeAuthupResponse = fakeResponse;

export { matchRoute as matchAuthupRoute };

function normalizeBody(input: unknown) : unknown {
    if (input instanceof URLSearchParams) {
        return Object.fromEntries(input);
    }

    if (typeof input === 'string') {
        try {
            return JSON.parse(input);
        } catch {
            return input;
        }
    }

    return input;
}

/**
 * A REAL `AuthupClient` wired to an in-memory transport.
 *
 * Deliberately NOT `@authup/core-http-kit/testing`'s `createFakeClient`: that
 * one overrides `request()` and hard-codes `new Response(null, { status: 200 })`,
 * so it can never produce a non-2xx. Hub's authup-facing services branch on
 * `isClientErrorWithStatusCode(e, 404)` (`AnalysisClientService.assign` /
 * `dismiss` / `assignDefaultPermissions`, `NodeClientService`), so those
 * branches are only reachable with a real error pipeline.
 *
 * Replacing only the transport keeps everything above it live — header merge,
 * body transform, decode, retry — and keeps the object a real `AuthupClient`,
 * so sub-API property lookup and hapic's `isClient()` marker behave normally.
 */
export class FakeAuthupClient extends AuthupClient {
    /** Normalized record of every dispatched request, in order. */
    public readonly requests : FakeAuthupRequest[];

    constructor(options: FakeAuthupClientOptions = {}) {
        const {
            handlers, 
            fallback, 
            ...clientOptions 
        } = options;

        const requests : FakeAuthupRequest[] = [];
        const map : FakeAuthupHandlerMap = handlers ?? {};
        const fb : FakeAuthupHandler = fallback ?? defaultFallback;

        const transport = new MemoryTransport({
            fetch: async (req: TransportRequest) : Promise<Response | MemoryResponseInit> => {
                const method = (req.method ?? 'GET').toUpperCase();
                const url = req.url ?? '';
                const match = matchRoute(method, url, map);

                const headers : Record<string, string> = {};
                new Headers(req.headers).forEach((value, key) => {
                    headers[key.toLowerCase()] = value;
                });

                const request : FakeAuthupRequest = {
                    method,
                    url,
                    body: normalizeBody(req.body),
                    params: match ? match.params : {},
                    headers,
                };
                requests.push(request);

                const data = match ?
                    await match.handler(request) :
                    await fb(request);

                if (data instanceof Response) {
                    return data;
                }

                return { status: 200, body: data };
            },
        });

        super({
            ...clientOptions,
            baseURL: clientOptions.baseURL ?? 'http://authup.fake.test',
            transport,
        });

        this.requests = requests;
    }
}

export function createFakeAuthupClient(options: FakeAuthupClientOptions = {}) : FakeAuthupClient {
    return new FakeAuthupClient(options);
}
