/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ICondition } from '@rapiq/core';
import { eq, inArray, or } from '@rapiq/core';
import { AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import type { ActorContext } from '@privateaim/server-kit';
import { prefixConditionFields } from '../../query/index.ts';
import type { AnalysisParticipationWhere } from '../../entities/analysis-node/types.ts';
import { ANALYSIS_READ_PERMISSIONS } from './constants.ts';
import type {
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
 * - Anyone else reaches what the grant's realm scope covers (`any`: every
 *   analysis), and a user additionally every analysis one of its realm's
 *   nodes takes part in.
 *
 * The grant is always compiled against the analysis itself — naming another
 * table's realm column would stop authup from lowering grant policies — and
 * re-rooted onto the queried entity's analysis relation. Participating ids
 * are collected first and matched with `inArray`, so lists and record reads
 * share one condition and pagination stays exact.
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
    ): Promise<ICondition | undefined> {
        const names = options.names ?? ANALYSIS_READ_PERMISSIONS;
        const approval: Pick<AnalysisParticipationWhere, 'approvalStatus'> = options.approvedOnly ?
            { approvalStatus: AnalysisNodeApprovalStatus.APPROVED } :
            {};

        await actor.permissionEvaluator.preEvaluateOneOf({ name: names });

        const binding = await this.resolveClientBinding(actor, target, approval);
        if (binding) {
            return binding;
        }

        const compiled = await actor.permissionEvaluator.compile({ name: names });

        let grant: ICondition;
        switch (compiled.verdict) {
            case 'allow':
                return undefined;
            case 'deny':
                return matchNothing();
            case 'conditional':
                grant = prefixConditionFields(compiled.condition, target.analysisPath);
                break;
            default:
                // `post`: a grant policy that cannot lower — narrowed to the
                // actor's own realm, as scopeReadQuery does.
                grant = actor.realm ?
                    prefixConditionFields(eq('realmId', actor.realm.id), target.analysisPath) :
                    matchNothing();
        }

        if (!actor.identity || actor.identity.type !== 'user' || !actor.realm) {
            return grant;
        }

        const ids = await this.analysisNodeRepository.findAnalysisIds({ nodeRealmId: actor.realm.id, ...approval });
        if (ids.length === 0) {
            return grant;
        }

        return or(grant, inArray(target.analysisIdAttributeName, ids));
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

        // `node.clientId` is writable by node managers and not unique, so the
        // binding only counts in the client's own realm: another realm cannot
        // claim a client by pointing its node at it.
        const { id: clientId, realmId } = actor.identity;

        const node = await this.nodeRepository.findOneBy({ clientId, realmId });
        if (node) {
            const ids = await this.analysisNodeRepository.findAnalysisIds({ nodeId: node.id, ...approval });
            return inArray(target.analysisIdAttributeName, ids);
        }

        const analysis = await this.analysisRepository.findOneBy({ clientId, realmId });
        if (analysis) {
            return eq(target.analysisIdAttributeName, analysis.id);
        }

        return undefined;
    }
}

function matchNothing(): ICondition {
    return inArray('id', []);
}
