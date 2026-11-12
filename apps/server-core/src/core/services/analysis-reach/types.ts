/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ICondition, IQuery } from '@rapiq/core';
import type { Analysis, AnalysisBucketType, Node } from '@privateaim/core-kit';
import type { ActorContext, EntityRepositoryFindManyResult, IEntityRepository } from '@privateaim/server-kit';
import type { IAnalysisNodeRepository } from '../../entities/analysis-node/types.ts';

/** A reach that is a query condition; `undefined` reaches every analysis. */
export type AnalysisReachLowered = {
    kind: 'lowered';
    condition: ICondition | undefined;
};

/**
 * A reach whose grant did not lower (`post`): which analyses it covers is
 * known only by evaluating each one.
 */
export type AnalysisReachPost = {
    kind: 'post';
    /**
     * What may narrow the candidates before the decision: the parts that
     * did lower. Never the reach itself.
     */
    candidates: ICondition | undefined;
    /** Column of the queried entity holding the analysis id. */
    analysisIdAttributeName: string;
    /** The reach as a condition, exact among the given analyses. */
    refine: (analyses: Analysis[]) => Promise<ICondition | undefined>;
};

/**
 * Which analyses an actor reaches. The two shapes share no condition
 * property on purpose: a reach is executed by
 * `IAnalysisReachService.findMany`, not appended by hand.
 */
export type AnalysisReach = AnalysisReachLowered | AnalysisReachPost;

export type AnalysisBucketTypeReach = {
    types: `${AnalysisBucketType}`[];
    /** `null`: none — the types are excluded. */
    reach: AnalysisReach | null;
};

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
    /**
     * Reach through the grant alone — no participation, and nothing for a
     * node's or analysis' own client (D3: deleting logs is the owner side's).
     */
    grantOnly?: boolean;
};

export interface IAnalysisReachService {
    /**
     * Pre-gate the capability one-of (a missing grant throws, i.e. 403) and
     * return the analyses the actor reaches.
     */
    resolve(
        actor: ActorContext,
        target: AnalysisReachTarget,
        options?: AnalysisReachOptions,
    ): Promise<AnalysisReach>;

    /**
     * Read the rows of `query` the reach covers, from the repository of the
     * entity the reach was resolved for. A `post` reach is decided per
     * analysis of the page, so the page may come back short and `meta.total`
     * loses only the rows this page dropped. A record read passes the query
     * with its `id` condition, so list and record share the decision.
     */
    findMany<T extends object>(
        repository: Pick<IEntityRepository<T>, 'findMany'>,
        query: IQuery,
        reach: AnalysisReach,
    ): Promise<EntityRepositoryFindManyResult<T>>;
}
