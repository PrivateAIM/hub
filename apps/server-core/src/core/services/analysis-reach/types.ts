/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ICondition, IQuery } from '@rapiq/core';
import type { AnalysisBucketType } from '@privateaim/core-kit';
import type { ActorContext, EntityRepositoryFindManyResult, IEntityRepository } from '@privateaim/server-kit';
import type { IAnalysisRepository } from '../../entities/analysis/types.ts';
import type { IAnalysisNodeRepository } from '../../entities/analysis-node/types.ts';
import type { INodeRepository } from '../../entities/node/types.ts';

/** A reach that is a query condition; `undefined` reaches every analysis. */
export type AnalysisReachLowered = {
    kind: 'lowered';
    condition: ICondition | undefined;
};

/**
 * Whether a row of the page, read with the reach's `checkFields`, is
 * reached. Only defined for rows that satisfy the reach's `candidates`.
 */
export type AnalysisRowMatcher = (row: object) => boolean;

/**
 * A reach whose grant did not lower (`post`): which analyses it covers is
 * known only by evaluating each one.
 */
export type AnalysisReachPost = {
    kind: 'post';
    /**
     * What narrows the candidates in the page read: every part that did
     * lower. Never the reach itself.
     */
    candidates: ICondition | undefined;
    /** Relation path to the analysis; `''` when the rows are the analyses. */
    analysisPath: string;
    /** Column of the queried entity holding the analysis id. */
    analysisIdAttributeName: string;
    /**
     * The fields of the queried row the decision reads (relation paths
     * dotted), loaded with the page by widening its projection.
     */
    checkFields: string[];
    /**
     * Decide the page's rows, given its distinct analyses (the rows
     * themselves when they are the analyses). A part that lowered holds for
     * every row already, through `candidates`.
     */
    refine: (analyses: object[]) => Promise<AnalysisRowMatcher>;
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
    analysisRepository: Pick<IAnalysisRepository, 'findMany' | 'findOneByClientBinding'>;
    nodeRepository: Pick<INodeRepository, 'findOneByClientBinding'>;
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
     * analysis of the page on the page read itself (its projection widened
     * to the reach's `checkFields` and trimmed again), so the page may come
     * back short or empty while `meta.total` stays the candidate count. A
     * record read passes the query with its `id` condition, so list and
     * record share the decision.
     */
    findMany<T extends object>(
        repository: Pick<IEntityRepository<T>, 'findMany'>,
        query: IQuery,
        reach: AnalysisReach,
    ): Promise<EntityRepositoryFindManyResult<T>>;
}
