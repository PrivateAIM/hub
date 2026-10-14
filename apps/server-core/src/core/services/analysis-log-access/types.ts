/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ActorContext } from '@privateaim/server-kit';
import type { IAnalysisRepository } from '../../entities/analysis/types.ts';
import type { INodeRepository } from '../../entities/node/types.ts';
import type { LogAccessIntent } from './constants.ts';

export type AnalysisLogAccessServiceContext = {
    analysisRepository: IAnalysisRepository;
    nodeRepository: INodeRepository;
};

/**
 * Authorizes the analysis(-node) log proxies BEFORE they forward to the
 * telemetry log store under server-core's own service credentials — the
 * store cannot tell callers apart, so this is the only gate those logs have.
 */
export interface IAnalysisLogAccessService {
    /**
     * Throws `BadRequestError` for a non-UUID id, `EntityNotFoundError` for
     * an unknown analysis and
     * `PermissionDeniedError` when the actor may not access its logs.
     */
    assertAnalysisLogAccess(
        analysisId: string,
        actor: ActorContext,
        intent: `${LogAccessIntent}`,
    ): Promise<void>;

    /**
     * Throws `BadRequestError` for a non-UUID id, `EntityNotFoundError` for
     * an unknown analysis or node and
     * `PermissionDeniedError` when the actor may not access the logs of that
     * node's run of the analysis.
     */
    assertAnalysisNodeLogAccess(
        analysisId: string,
        nodeId: string,
        actor: ActorContext,
        intent: `${LogAccessIntent}`,
    ): Promise<void>;
}
