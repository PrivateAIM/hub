/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientOptions } from '../http/api-client';

/**
 * A dispatched request, normalized for assertions: the route pattern's
 * captured `:params`, lower-cased headers (client-level defaults included)
 * and a JSON-parsed body.
 */
export type FakeRequest = {
    method: string,
    url: string,
    body?: unknown,
    params: Record<string, string>,
    headers: Record<string, string>
};

/**
 * Answers one request. The return value is the response BODY — the client
 * wraps it in a 200. To produce a non-2xx, return `fakeResponse(status, body)`.
 */
export type FakeHandler = (request: FakeRequest) => unknown | Promise<unknown>;

/**
 * Keys are `'<METHOD> /<path>'`, where a segment may be a `:name` placeholder
 * (`'GET /projects/:id'`). The `'*'` key is a catch-all that always loses to a
 * specific pattern.
 */
export type FakeHandlerMap = Record<string, FakeHandler>;

export type FakeClientOptions = ClientOptions & {
    handlers?: FakeHandlerMap,
    fallback?: FakeHandler
};
