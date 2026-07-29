/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '@rapiq/core';
import type { DomainTypeMap } from '@privateaim/core-kit';
import type { IEntityAPI } from '../domains';
import type { ICoreClient } from './types';

/**
 * The `DomainType` values that name a conforming entity API on `ICoreClient`.
 *
 * `service` and the four `DomainSubType` keys drop out of the intersection on
 * their own. `analysisLog` / `analysisNodeLog` have to be excluded EXPLICITLY:
 * both expose `delete(query): Promise<void>` — unassignable to
 * `delete(id): Promise<EntityRecordResponse<T>>`, and `Partial<>` does not
 * rescue it because it makes members optional rather than relaxing a present
 * member's signature. Both also `getMany` telemetry-kit's `Log` rather than
 * their own entity, and neither entity declares an `id`, so `DomainEntityID<T>`
 * resolves to `never`.
 */
export type ClientEntityAPIKey =    Exclude<keyof ICoreClient & keyof DomainTypeMap, 'analysisLog' | 'analysisNodeLog'>;

/**
 * Every verb is OPTIONAL: read-only APIs (`analysisNodeEvent`) and no-create
 * APIs (`masterImage`, `masterImageGroup`) are members too. Callers guard per
 * method, exactly as the client-vue dispatch sites already do.
 */
export type EntityAPIDispatch<T extends ObjectLiteral> = Partial<IEntityAPI<T, any, any>>;

export type ClientEntityAPIRegistry = {
    [K in ClientEntityAPIKey]: EntityAPIDispatch<DomainTypeMap[K]>
};

/**
 * Resolve a sub-API by its `DomainType` string.
 *
 * The value of this function is the cast-free assignment inside it: it is a
 * compile-time proof that every conforming sub-API's record type still lines
 * up with `DomainTypeMap`, and it fails the build on drift.
 *
 * It does NOT remove the narrow casts at the client-vue dispatch sites —
 * `createList` and `createEntityManager` are generic over ALL `DomainTypeMap`
 * keys, including the two excluded logs and the four sub-types.
 */
export function pickEntityAPI(client: ICoreClient, type: string) : EntityAPIDispatch<any> | undefined {
    const registry : ClientEntityAPIRegistry = client;

    if (!Object.prototype.hasOwnProperty.call(registry, type)) {
        return undefined;
    }

    return registry[type as ClientEntityAPIKey] as EntityAPIDispatch<any>;
}
