/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientOptionsInput, IClient as IBaseClient } from 'hapic';
import type {
    IAnalysisAPI,
    IAnalysisBucketAPI,
    IAnalysisBucketFileAPI,
    IAnalysisLogAPI,
    IAnalysisNodeAPI,
    IAnalysisNodeEventAPI,
    IAnalysisNodeLogAPI,
    IEntityAPI,
    IMasterImageAPI,
    IMasterImageGroupAPI,
    INodeAPI,
    IProjectAPI,
    IProjectNodeAPI,
    IRegistryAPI,
    IRegistryProjectAPI,
    IServiceAPI,
} from '../domains';
import type { ObjectLiteral } from '@rapiq/core';
import type { DomainTypeMap } from '@privateaim/core-kit';

/**
 * hapic's full construction surface, which — unlike `RequestBaseOptions` —
 * carries `transport`. That is what lets a test inject a `MemoryTransport`
 * (see `@privateaim/core-http-kit/testing`) without touching the client.
 */
export type ClientOptions = ClientOptionsInput;

/**
 * Replaceable contract of the hub core HTTP client: hapic's base transport
 * surface plus every sub-API behind its own interface. Implemented by `Client`.
 *
 * Members are typed as INTERFACES rather than the concrete API classes, so the
 * type stays purely structural — a concrete class satisfies it, and a src-copy
 * vs dist-copy comparison cannot trip over `BaseAPI`'s `protected client`.
 */
export interface ICoreClient extends IBaseClient {
    readonly masterImage : IMasterImageAPI;
    readonly masterImageGroup : IMasterImageGroupAPI;
    readonly project : IProjectAPI;
    readonly projectNode : IProjectNodeAPI;
    readonly registry : IRegistryAPI;
    readonly registryProject : IRegistryProjectAPI;
    readonly node : INodeAPI;
    readonly analysis : IAnalysisAPI;
    readonly analysisBucket : IAnalysisBucketAPI;
    readonly analysisBucketFile : IAnalysisBucketFileAPI;
    readonly analysisLog : IAnalysisLogAPI;
    readonly analysisNode : IAnalysisNodeAPI;
    readonly analysisNodeEvent : IAnalysisNodeEventAPI;
    readonly analysisNodeLog : IAnalysisNodeLogAPI;
    readonly service : IServiceAPI;
}

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
