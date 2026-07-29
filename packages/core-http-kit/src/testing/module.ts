/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport } from 'hapic';
import type { MemoryResponseInit, TransportRequest } from 'hapic';
import { Client } from '../client';
import { matchRoute } from './matcher';
import type {
    FakeClientOptions, 
    FakeHandler, 
    FakeHandlerMap, 
    FakeRequest,
} from './types';

/**
 * `EntityCollectionResponse.meta.limit`/`offset` are optional, so an empty
 * collection needs only `total`.
 */
const defaultFallback : FakeHandler = () => ({ data: [], meta: { total: 0 } });

/**
 * Drive a non-2xx through the REAL hapic error pipeline, so `createClientError`
 * runs and the client's own `RESPONSE_ERROR` hook rewrites `error.message`
 * from the payload — exactly as it does in production.
 */
export function fakeResponse(status: number, body?: any) : Response {
    return new Response(body === undefined ? null : JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
    });
}

/**
 * At transport level a JSON payload has already been serialized to a string by
 * the request transformer, while `URLSearchParams` is passed through untouched.
 */
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
 * A REAL `Client` wired to an in-memory transport.
 *
 * Because only the transport is replaced, everything above it still runs: the
 * constructor's `RESPONSE_ERROR` hook, any `ClientAuthenticationHook` attached
 * later, header merging, body transformation, decoding and retry. It also stays
 * a genuine subclass, so `isClient()` and own-property sub-API lookup
 * (`client[entityType]`) behave exactly as in production.
 */
export class FakeClient extends Client {
    /**
     * Normalized view of every dispatched request (captured params,
     * lower-cased headers, parsed body). The RAW post-pipeline record lives on
     * the transport itself as `MemoryTransport.requests` (plus `reset()`).
     *
     * Deliberately declared WITHOUT an initializer: under `target: ES2022` and
     * `useDefineForClassFields`, a `= []` here would be `[[Define]]`d right
     * after `super()` and overwrite the array the transport closes over.
     */
    public readonly requests : FakeRequest[];

    constructor(options: FakeClientOptions = {}) {
        const {
            handlers, 
            fallback, 
            ...clientOptions 
        } = options;

        const requests : FakeRequest[] = [];
        const map : FakeHandlerMap = handlers ?? {};
        const fb : FakeHandler = fallback ?? defaultFallback;

        const transport = new MemoryTransport({
            fetch: async (req: TransportRequest) : Promise<Response | MemoryResponseInit> => {
                // LOAD-BEARING: a `responseType: 'stream'` request dispatches
                // with `method === undefined` (AnalysisAPI.streamFiles /
                // downloadResult take that path), so it must default to GET.
                const method = (req.method ?? 'GET').toUpperCase();
                const url = req.url ?? '';
                const match = matchRoute(method, url, map);

                // hapic hands over already-merged headers; `Headers` lower-cases
                // the keys, and client-level defaults (setAuthorizationHeader)
                // are already present.
                const headers : Record<string, string> = {};
                new Headers(req.headers).forEach((value, key) => {
                    headers[key.toLowerCase()] = value;
                });

                const request : FakeRequest = {
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

                // MemoryResponseInit — a bare `{ data, meta }` would carry no
                // key hapic recognizes and answer an EMPTY 200.
                return { status: 200, body: data };
            },
        });

        super({
            ...clientOptions,
            baseURL: clientOptions.baseURL ?? 'http://fake.test',
            transport,
        });

        this.requests = requests;
    }
}

export function createFakeClient(options: FakeClientOptions = {}) : FakeClient {
    return new FakeClient(options);
}
