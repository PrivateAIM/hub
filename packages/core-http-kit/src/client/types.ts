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
    IMasterImageAPI,
    IMasterImageGroupAPI,
    INodeAPI,
    IProjectAPI,
    IProjectNodeAPI,
    IRegistryAPI,
    IRegistryProjectAPI,
    IServiceAPI,
} from '../domains';

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
