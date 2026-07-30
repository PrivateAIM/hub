/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '@rapiq/core';
import type { DomainTypeMap, IEntityAPI } from '../../domains';
import type { IStorageClient } from './types';

export type ClientEntityAPIKey = keyof IStorageClient & keyof DomainTypeMap;

/** Verbs are OPTIONAL — callers guard the ones they use. See core-http-kit. */
export type EntityAPIDispatch<T extends ObjectLiteral> = Partial<IEntityAPI<T, any, any>>;

export type ClientEntityAPIRegistry = {
    [K in ClientEntityAPIKey]: EntityAPIDispatch<DomainTypeMap[K]>
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

    if (!Object.prototype.hasOwnProperty.call(registry, type)) {
        return undefined;
    }

    // The caller asserts that `type` names TYPE. A runtime string cannot prove
    // that to the compiler, so the one unsound step is isolated HERE instead of
    // being repeated as an `as any` at every dispatch site.
    return registry[type as ClientEntityAPIKey] as unknown as EntityAPIDispatch<TYPE>;
}
