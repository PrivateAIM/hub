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
import type {
    ActorContext,
    EntityRepositoryFindManyResult,
    IEntityRepository,
    ReadProjection,
} from '@privateaim/server-kit';
import {
    appendQueryConditions,
    buildCheckFields,
    readCheckAttributes,
    readPath,
    trimReadProjection,
    widenReadProjection,
} from '@privateaim/server-kit';
import { prefixConditionFields } from '../../query/index.ts';
import type { AnalysisParticipationWhere } from '../../entities/analysis-node/types.ts';
import { analysisSchema } from '../../entities/analysis/schema.ts';
import { ANALYSIS_READ_PERMISSIONS } from './constants.ts';
import type {
    AnalysisReach,
    AnalysisReachOptions,
    AnalysisReachPost,
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
            analysisPath: target.analysisPath,
            analysisIdAttributeName: target.analysisIdAttributeName,
            // Rows that are analyses are evaluated themselves, on their whole
            // default row; any other row only names its analysis.
            checkFields: target.analysisPath === '' ?
                buildCheckFields(analysisSchema) :
                [target.analysisIdAttributeName],
            refine: async (analyses) => {
                const reached = new Set<unknown>();

                for (const analysis of analyses) {
                    const id = Reflect.get(analysis, 'id');
                    const isReached = (typeof id === 'string' && participating.includes(id)) ||
                        await reachesRecordOneOf(actor.permissionEvaluator, {
                            name: names,
                            realm: readRealm(analysis),
                            data: { [BuiltInPolicyType.ATTRIBUTES]: analysis },
                        });

                    if (isReached) {
                        reached.add(id);
                    }
                }

                return (row) => reached.has(readPath(row, target.analysisIdAttributeName));
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

        // One read of the page: what the decision reads of each row is loaded
        // with it, so the rows returned are the rows decided.
        const projection = widenReadProjection(query, reach.checkFields);
        const result = await repository.findMany(
            reach.candidates ? appendQueryConditions(projection.query, reach.candidates) : projection.query,
        );

        if (result.data.length === 0) {
            return result;
        }

        const matches = await reach.refine(await this.loadAnalyses(result.data, reach, projection));
        const data = result.data.filter((row) => matches(row));

        return { data: trimReadProjection(data, projection), meta: result.meta };
    }

    /**
     * The page's distinct analyses, each decided once: the rows themselves
     * when they are the analyses, else loaded in one query of the analysis
     * table (whole rows).
     */
    protected async loadAnalyses(
        rows: object[],
        reach: AnalysisReachPost,
        projection: ReadProjection,
    ): Promise<object[]> {
        if (reach.analysisPath === '') {
            return rows.map((row) => readCheckAttributes(row, projection));
        }

        const ids = new Set<string>();

        for (const row of rows) {
            const id = readPath(row, reach.analysisIdAttributeName);

            if (typeof id === 'string') {
                ids.add(id);
            }
        }

        if (ids.size === 0) {
            return [];
        }

        const { data } = await this.analysisRepository.findMany(
            appendQueryConditions(new Query({}), inArray('id', [...ids])),
        );

        return data;
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

/**
 * The analysis' realm, raw. Anything but a realm id or `null` reads as
 * `undefined`, which the record helpers refuse instead of matching.
 */
function readRealm(analysis: object): string | null | undefined {
    const value: unknown = Reflect.get(analysis, 'realmId');

    if (typeof value === 'string') {
        return value;
    }

    return value === null ? null : undefined;
}
