/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ICondition } from '@rapiq/core';
import type { Analysis, Node } from '@privateaim/core-kit';
import type { ActorContext, IEntityRepository } from '@privateaim/server-kit';
import type { IAnalysisNodeRepository } from '../../entities/analysis-node/types.ts';

export type AnalysisReachServiceContext = {
    analysisNodeRepository: IAnalysisNodeRepository;
    analysisRepository: IEntityRepository<Analysis>;
    nodeRepository: IEntityRepository<Node>;
};

/**
 * Columns of the queried entity: its owner realm, and the analysis it
 * belongs to (`id` for the analysis itself).
 */
export type AnalysisReachTarget = {
    realmAttributeName: string;
    analysisIdAttributeName: string;
};

export interface IAnalysisReachService {
    /**
     * Pre-gate the analysis read one-of (a missing grant throws, i.e. 403)
     * and return the condition that narrows a query to the analyses the
     * actor reaches — `undefined` when it reaches every analysis.
     */
    resolve(actor: ActorContext, target: AnalysisReachTarget): Promise<ICondition | undefined>;
}
