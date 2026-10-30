/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    ClientEntityAPIKey,
    ClientEntityAPIRegistry,
    EntityAPIDispatch,
    ICoreClient,
} from './types';
import type { ObjectLiteral } from '@rapiq/core';
import { hasOwnProperty } from '@privateaim/kit';

/**
 * RUNTIME allow-list of the registry keys.
 *
 * A `hasOwnProperty` check against the client is NOT enough: the client really
 * does carry `analysisLog` / `analysisNodeLog` as own properties, so excluding
 * them from `ClientEntityAPIKey` only hides them from the compiler while
 * `pickEntityAPI` would still hand them out. Typing this as
 * `Record<ClientEntityAPIKey, true>` makes the object literal exhaustive in both
 * directions — a key added to the type but not here (or vice versa) fails the
 * build — so the runtime list cannot drift from the type.
 */
const ENTITY_API_KEYS : Record<ClientEntityAPIKey, true> = {
    masterImage: true,
    masterImageGroup: true,
    project: true,
    projectNode: true,
    registry: true,
    registryProject: true,
    node: true,
    analysis: true,
    analysisBucket: true,
    analysisBucketFile: true,
    analysisNode: true,
    analysisNodeEvent: true,
};

/**
 * Resolve a sub-API by its `DomainType` string, or `undefined` when the client
 * carries no such entity API.
 *
 * Two things happen here that a caller cannot do for itself:
 *
 * 1. `const registry : ClientEntityAPIRegistry = client;` is cast-free, which
 *    makes this a compile-time proof that every conforming sub-API's record
 *    type still lines up with `DomainTypeMap` — the build fails on drift.
 * 2. The own-property check and the untyped index access are centralised, so
 *    dispatch sites keep neither a `hasOwnProperty` guard nor an `as any`.
 *
 * `TYPE` is supplied by the caller because `createEntityManager` / `createList`
 * are generic over ALL `DomainTypeMap` keys — including the two excluded logs
 * and the four `DomainSubType` keys, none of which this registry covers. The
 * returned verbs are therefore all OPTIONAL, and callers must guard the ones
 * they use (`typeof api.create === 'function'`): `masterImage` has no `create`
 * and `analysisNodeEvent` is read-only.
 */
export function pickEntityAPI<TYPE extends ObjectLiteral>(
    client: ICoreClient,
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
