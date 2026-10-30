/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    ClientEntityAPIKey,
    ClientEntityAPIRegistry,
    EntityAPIDispatch,
    IStorageClient,
} from './types';
import { hasOwnProperty } from '@privateaim/kit';
import type { ObjectLiteral } from '@rapiq/core';

/**
 * RUNTIME allow-list. `Record<ClientEntityAPIKey, true>` keeps it exhaustive in
 * both directions, so it cannot drift from the type. See core-http-kit for why
 * a `hasOwnProperty` check against the client is not sufficient.
 */
const ENTITY_API_KEYS : Record<ClientEntityAPIKey, true> = {
    bucket: true,
    bucketFile: true,
};

/**
 * Resolve a storage sub-API by its `DomainType` string. Mirrors
 * `pickEntityAPI` in `@privateaim/core-http-kit`, including the cast-free
 * `ClientEntityAPIRegistry` assignment that proves record-type alignment at
 * compile time.
 */
export function pickEntityAPI<TYPE extends ObjectLiteral>(
    client: IStorageClient,
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
