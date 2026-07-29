/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AuthupClient } from '@privateaim/server-kit';
import { MemoryTransport } from 'hapic';
import type { MemoryResponseInit, TransportRequest } from 'hapic';

/**
 * A dispatched request, normalized for assertions: the route pattern's captured
 * `:params`, lower-cased headers and a JSON-parsed body.
 */
export type FakeAuthupRequest = {
    method: string,
    url: string,
    body?: unknown,
    params: Record<string, string>,
    headers: Record<string, string>
};

/**
 * Answers one request. The return value is the response BODY — the client wraps
 * it in a 200. To produce a non-2xx, return `fakeAuthupResponse(status, body)`.
 */
export type FakeAuthupHandler = (request: FakeAuthupRequest) => unknown | Promise<unknown>;

/**
 * Keys are `'<METHOD> /<path>'`, where a segment may be a `:name` placeholder
 * (`'GET /clients/:id'`). The `'*'` key is a catch-all that always loses to a
 * specific pattern.
 */
export type FakeAuthupHandlerMap = Record<string, FakeAuthupHandler>;

export type FakeAuthupClientOptions = {
    baseURL?: string,
    handlers?: FakeAuthupHandlerMap,
    fallback?: FakeAuthupHandler
};

type RouteMatch = {
    handler: FakeAuthupHandler,
    params: Record<string, string>
};

const defaultFallback : FakeAuthupHandler = () => ({ data: [], meta: { total: 0 } });

function matchPath(pattern: string, path: string) : Record<string, string> | null {
    const patternSegments = pattern.split('/').filter(Boolean);
    const pathSegments = path.split('/').filter(Boolean);

    if (patternSegments.length !== pathSegments.length) {
        return null;
    }

    const params : Record<string, string> = {};
    for (const [i, patternSegment] of patternSegments.entries()) {
        if (patternSegment.startsWith(':')) {
            params[patternSegment.slice(1)] = pathSegments[i];
        } else if (patternSegment !== pathSegments[i]) {
            return null;
        }
    }

    return params;
}

/**
 * Resolve a handler for a dispatched request. Same semantics as the matcher in
 * `@privateaim/<kit>/testing`: query string ignored, equal segment count
 * required, `'*'` deferred so a specific pattern always beats it, and first
 * insertion-order match wins among specific patterns.
 */
export function matchAuthupRoute(
    method: string,
    url: string,
    handlers: FakeAuthupHandlerMap,
) : RouteMatch | null {
    const path = new URL(url, 'http://localhost').pathname;

    let catchAll : RouteMatch | null = null;

    const keys = Object.keys(handlers);
    for (const key of keys) {
        if (key === '*') {
            catchAll = { handler: handlers[key], params: {} };
            continue;
        }

        const separatorIndex = key.indexOf(' ');
        if (separatorIndex === -1) {
            continue;
        }

        if (key.slice(0, separatorIndex).toUpperCase() !== method) {
            continue;
        }

        const params = matchPath(key.slice(separatorIndex + 1), path);
        if (params) {
            return { handler: handlers[key], params };
        }
    }

    return catchAll;
}

/**
 * Drive a non-2xx through the REAL hapic error pipeline, so the rejection is a
 * genuine hapic `ClientError` that `isClientErrorWithStatusCode(e, 404)`
 * recognizes.
 */
export function fakeAuthupResponse(status: number, body?: any) : Response {
    return new Response(body === undefined ? null : JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
    });
}

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
 * `isClientErrorWithStatusCode(e, 404)` (see `AnalysisClientService.assign` /
 * `dismiss` / `assignDefaultPermissions`, and `NodeClientService`), so those
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
                const match = matchAuthupRoute(method, url, map);

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
