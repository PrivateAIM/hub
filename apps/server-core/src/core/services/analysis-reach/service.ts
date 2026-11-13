/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuiltInPolicyType, reachesRecordOneOf } from '@authup/access';
import type { ICondition, IQuery } from '@rapiq/core';
import {
    Query,
    eq,
    inArray,
    or,
} from '@rapiq/core';
import { AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import type { ActorContext, EntityRepositoryFindManyResult, IEntityRepository } from '@privateaim/server-kit';
import { appendQueryConditions } from '@privateaim/server-kit';
import { prefixConditionFields } from '../../query/index.ts';
import type { AnalysisParticipationWhere } from '../../entities/analysis-node/types.ts';
import { ANALYSIS_READ_PERMISSIONS } from './constants.ts';
import type {
    AnalysisReach,
    AnalysisReachOptions,
    AnalysisReachServiceContext,
    AnalysisReachTarget,
    IAnalysisReachService,
} from './types.ts';

/**
 * Which analyses an actor may read (plan 021, D5–D8).
 *
 * - A node's or analysis' own client reaches by its binding alone: the
 *   analyses its node takes part in, or its one analysis. Its realm and the
 *   realm scope of its grants confer nothing.
 * - Anyone else reaches what the grant covers (`any`: every analysis), and a
 *   user additionally every analysis one of its realm's nodes takes part in.
 *
 * The grant is always compiled against the analysis itself — naming another
 * table's realm column would stop authup from lowering grant policies — and
 * re-rooted onto the queried entity's analysis relation. Participating ids
 * are collected first and matched with `inArray`, so lists and record reads
 * share one condition and pagination stays exact.
 *
 * A grant that does not lower (`post`) is decided by evaluating each
 * candidate analysis — the analysis row and its realm, whatever entity is
 * queried — and never by the actor's realm. {@link findMany} runs a read
 * under either kind of reach.
 */
export class AnalysisReachService implements IAnalysisReachService {
    protected analysisNodeRepository: AnalysisReachServiceContext['analysisNodeRepository'];

    protected analysisRepository: AnalysisReachServiceContext['analysisRepository'];

    protected nodeRepository: AnalysisReachServiceContext['nodeRepository'];

    constructor(ctx: AnalysisReachServiceContext) {
        this.analysisNodeRepository = ctx.analysisNodeRepository;
        this.analysisRepository = ctx.analysisRepository;
        this.nodeRepository = ctx.nodeRepository;
    }

    async resolve(
        actor: ActorContext,
        target: AnalysisReachTarget,
        options: AnalysisReachOptions = {},
    ): Promise<AnalysisReach> {
        const names = options.names ?? ANALYSIS_READ_PERMISSIONS;
        const approval: Pick<AnalysisParticipationWhere, 'approvalStatus'> = options.approvedOnly ?
            { approvalStatus: AnalysisNodeApprovalStatus.APPROVED } :
            {};

        await actor.permissionEvaluator.preEvaluateOneOf({ name: names });

        const binding = await this.resolveClientBinding(actor, target, approval);

        if (binding) {
            return lowered(options.grantOnly ? matchNothing() : binding);
        }

        const compiled = await actor.permissionEvaluator.compile({ name: names });

        if (compiled.verdict === 'allow') {
            return lowered(undefined);
        }

        if (compiled.verdict === 'deny') {
            return lowered(matchNothing());
        }

        const participating = options.grantOnly || !actor.identity || actor.identity.type !== 'user' || !actor.realm ?
            [] :
            await this.analysisNodeRepository.findAnalysisIds({ nodeRealmId: actor.realm.id, ...approval });

        if (compiled.verdict === 'conditional') {
            const grant = prefixConditionFields(compiled.condition, target.analysisPath);

            return lowered(participating.length === 0 ?
                grant :
                or(grant, inArray(target.analysisIdAttributeName, participating)));
        }

        // `post`: the grant decides per analysis, participation still by id.
        return {
            kind: 'post',
            candidates: undefined,
            analysisIdAttributeName: target.analysisIdAttributeName,
            refine: async (analyses) => {
                const reached: string[] = [];

                for (const analysis of analyses) {
                    const isReached = participating.includes(analysis.id) ||
                        await reachesRecordOneOf(actor.permissionEvaluator, {
                            name: names,
                            realm: analysis.realmId,
                            data: { [BuiltInPolicyType.ATTRIBUTES]: analysis },
                        });

                    if (isReached) {
                        reached.push(analysis.id);
                    }
                }

                return inArray(target.analysisIdAttributeName, reached);
            },
        };
    }

    async findMany<T extends object>(
        repository: Pick<IEntityRepository<T>, 'findMany'>,
        query: IQuery,
        reach: AnalysisReach,
    ): Promise<EntityRepositoryFindManyResult<T>> {
        if (reach.kind === 'lowered') {
            return repository.findMany(reach.condition ? appendQueryConditions(query, reach.condition) : query);
        }

        const result = await repository.findMany(reach.candidates ? appendQueryConditions(query, reach.candidates) : query);

        if (result.data.length === 0) {
            return result;
        }

        // The page's distinct analyses, loaded once and decided once each.
        const ids = result.data.map((row) => Reflect.get(row, 'id'));
        const analysisIds = await this.collectAnalysisIds(repository, result.data, ids, reach.analysisIdAttributeName);
        const { data: analyses } = await this.analysisRepository.findMany(
            appendQueryConditions(new Query({}), inArray('id', analysisIds)),
        );

        const condition = await reach.refine(analyses);

        if (!condition) {
            return result;
        }

        // The refined reach is a condition again: which of the page's rows it
        // covers is the repository's answer, as for a reach that lowered.
        const { data: reachedRows } = await repository.findMany(
            appendQueryConditions(new Query({}), inArray('id', ids), condition),
        );
        const reached = new Set(reachedRows.map((row) => Reflect.get(row, 'id')));
        const data = result.data.filter((row) => reached.has(Reflect.get(row, 'id')));

        return { data, meta: result.meta };
    }

    /**
     * The analysis ids of a page's rows, re-read by id when a sparse
     * fieldset left the column out.
     */
    protected async collectAnalysisIds<T extends object>(
        repository: Pick<IEntityRepository<T>, 'findMany'>,
        rows: T[],
        ids: unknown[],
        attributeName: string,
    ): Promise<string[]> {
        let values = rows.map((row) => Reflect.get(row, attributeName));

        const isSparse = values.some((value) => typeof value !== 'string');

        if (isSparse) {
            const { data } = await repository.findMany(appendQueryConditions(new Query({}), inArray('id', ids)));

            values = data.map((row) => Reflect.get(row, attributeName));
        }

        return [...new Set(values.filter((value) => typeof value === 'string'))];
    }

    /** The reach of a node's or analysis' own client; `undefined` for any other identity. */
    protected async resolveClientBinding(
        actor: ActorContext,
        target: AnalysisReachTarget,
        approval: Pick<AnalysisParticipationWhere, 'approvalStatus'>,
    ): Promise<ICondition | undefined> {
        if (!actor.identity || actor.identity.type !== 'client' || !actor.identity.realmId) {
            return undefined;
        }

        // The binding only counts in the client's own realm: another realm
        // cannot claim a client by pointing its node at it.
        const { id: clientId, realmId } = actor.identity;

        const node = await this.nodeRepository.findOneByClientBinding(clientId, realmId);

        if (node) {
            const ids = await this.analysisNodeRepository.findAnalysisIds({ nodeId: node.id, ...approval });

            return inArray(target.analysisIdAttributeName, ids);
        }

        const analysis = await this.analysisRepository.findOneByClientBinding(clientId, realmId);

        if (analysis) {
            return eq(target.analysisIdAttributeName, analysis.id);
        }

        return undefined;
    }
}

function lowered(condition: ICondition | undefined): AnalysisReach {
    return { kind: 'lowered', condition };
}

function matchNothing(): ICondition {
    return inArray('id', []);
}
