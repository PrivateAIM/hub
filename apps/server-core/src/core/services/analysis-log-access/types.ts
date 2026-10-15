/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ActorContext } from '@privateaim/server-kit';
import type { IAnalysisRepository } from '../../entities/analysis/types.ts';
import type { IAnalysisNodeRepository } from '../../entities/analysis-node/types.ts';
import type { INodeRepository } from '../../entities/node/types.ts';
import type { IAnalysisReachService } from '../analysis-reach/types.ts';
import type { LogAccessIntent } from './constants.ts';

export type AnalysisLogAccessServiceContext = {
    analysisRepository: IAnalysisRepository;
    analysisNodeRepository: IAnalysisNodeRepository;
    nodeRepository: INodeRepository;
    reach: IAnalysisReachService;
};

/**
 * Authorizes the analysis(-node) log proxies BEFORE they forward to the
 * telemetry log store under server-core's own service credentials — the
 * store cannot tell callers apart, so this is the only gate those logs have.
 */
export interface IAnalysisLogAccessService {
    /**
     * Throws `BadRequestError` for a non-UUID id, `PermissionDeniedError`
     * when the actor lacks the capability and `EntityNotFoundError` for an
     * analysis that is unknown or out of reach.
     */
    assertAnalysisLogAccess(
        analysisId: string,
        actor: ActorContext,
        intent: `${LogAccessIntent}`,
    ): Promise<void>;

    /**
     * Throws `BadRequestError` for a non-UUID id, `PermissionDeniedError`
     * when the actor lacks the capability and `EntityNotFoundError` for an
     * analysis or node that is unknown, or a node run out of reach.
     */
    assertAnalysisNodeLogAccess(
        analysisId: string,
        nodeId: string,
        actor: ActorContext,
        intent: `${LogAccessIntent}`,
    ): Promise<void>;

    /**
     * Throws `PermissionDeniedError` when the actor lacks
     * ANALYSIS_NODE_LOG_CREATE or is neither the node's own client nor
     * reaches the node's realm, and a `ValidupError` for an unknown node or
     * analysis.
     */
    assertAnalysisNodeLogCreate(analysisId: string, nodeId: string, actor: ActorContext): Promise<void>;
}
