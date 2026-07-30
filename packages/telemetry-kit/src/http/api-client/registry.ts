/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasOwnProperty } from '@privateaim/kit';
import type { ObjectLiteral } from '@rapiq/core';
import type { DomainTypeMap, IEntityAPI } from '../../domains';
import type { ITelemetryClient } from './types';

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

/**
 * RUNTIME allow-list. Load-bearing here: the client really does carry `log` as
 * an own property, so excluding it from `ClientEntityAPIKey` alone would hide
 * it from the compiler while `pickEntityAPI` still handed it out.
 * `Record<ClientEntityAPIKey, true>` keeps this exhaustive in both directions.
 */
const ENTITY_API_KEYS : Record<ClientEntityAPIKey, true> = { event: true };

/**
 * Resolve a telemetry sub-API by its `DomainType` string. Mirrors
 * `pickEntityAPI` in `@privateaim/core-http-kit`, including the cast-free
 * `ClientEntityAPIRegistry` assignment that proves record-type alignment at
 * compile time.
 */
export function pickEntityAPI<TYPE extends ObjectLiteral>(
    client: ITelemetryClient,
    type: string,
) : EntityAPIDispatch<TYPE> | undefined {
    const registry : ClientEntityAPIRegistry = client;

    if (!hasOwnProperty(ENTITY_API_KEYS, type)) {
        return undefined;
    }

    // The caller asserts that `type` names TYPE. A runtime string cannot prove
    // that to the compiler, so the one unsound step is isolated HERE instead of
    // being repeated as an `as any` at every dispatch site.
    return registry[type as ClientEntityAPIKey] as unknown as EntityAPIDispatch<TYPE>;
}
