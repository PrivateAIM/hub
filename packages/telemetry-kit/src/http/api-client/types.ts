/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientOptionsInput, IClient as IBaseClient } from 'hapic';
import type {
    DomainTypeMap,
    IEntityAPI,
    IEventAPI,
    ILogAPI,
} from '../../domains';
import type { ObjectLiteral } from '@rapiq/core';

/**
 * hapic's full construction surface, which — unlike `RequestBaseOptions` —
 * carries `transport`. That is what lets a test inject a `MemoryTransport`
 * (see `@privateaim/telemetry-kit/testing`) without touching the client.
 */
export type ClientOptions = ClientOptionsInput;

/**
 * Replaceable contract of the hub telemetry HTTP client. Implemented by
 * `APIClient`. Members are typed as INTERFACES rather than the concrete API
 * classes, so the type stays purely structural.
 */
export interface ITelemetryClient extends IBaseClient {
    readonly event : IEventAPI;
    readonly log : ILogAPI;
}

/**
 * `log` drops out on its own: `ILogAPI` is append-and-query only (no `getOne`,
 * no `update`, a query-keyed `deleteMany`), so it does not structurally satisfy
 * `EntityAPIDispatch`'s id-keyed `delete`. Only `event` is a conforming entity
 * API, and it is the one entity the UI dispatches by string.
 */
export type ClientEntityAPIKey = Exclude<keyof ITelemetryClient & keyof DomainTypeMap, 'log'>;

/** Verbs are OPTIONAL — callers guard the ones they use. See core-http-kit. */
export type EntityAPIDispatch<T extends ObjectLiteral> = Partial<IEntityAPI<T, any, any>>;

export type ClientEntityAPIRegistry = {
    [K in ClientEntityAPIKey]: EntityAPIDispatch<DomainTypeMap[K]>
};
