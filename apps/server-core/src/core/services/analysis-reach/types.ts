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

/** Where the queried entity keeps its analysis. */
export type AnalysisReachTarget = {
    /** Relation path to the analysis; `''` for the analysis itself. */
    analysisPath: string;
    /** Column holding the analysis id (`id` for the analysis itself). */
    analysisIdAttributeName: string;
};

export type AnalysisReachOptions = {
    /** The capability one-of; defaults to the analysis read permissions. */
    names?: string[];
    /** Count only participation through an approved node (RESULT/TEMP, D2). */
    approvedOnly?: boolean;
};

export interface IAnalysisReachService {
    /**
     * Pre-gate the capability one-of (a missing grant throws, i.e. 403) and
     * return the condition that narrows a query to the analyses the actor
     * reaches — `undefined` when it reaches every analysis.
     */
    resolve(
        actor: ActorContext,
        target: AnalysisReachTarget,
        options?: AnalysisReachOptions,
    ): Promise<ICondition | undefined>;
}
