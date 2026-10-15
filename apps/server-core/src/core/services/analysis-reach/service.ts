/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ICondition } from '@rapiq/core';
import { eq, inArray, or } from '@rapiq/core';
import type { ActorContext } from '@privateaim/server-kit';
import { ANALYSIS_READ_PERMISSIONS } from './constants.ts';
import type {
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
 *   nodes takes part in, whatever that node's approval status.
 *
 * Participating ids are collected first and matched with `inArray`, so lists
 * and record reads share one condition and pagination stays exact.
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

    async resolve(actor: ActorContext, target: AnalysisReachTarget): Promise<ICondition | undefined> {
        await actor.permissionEvaluator.preEvaluateOneOf({ name: ANALYSIS_READ_PERMISSIONS });

        const binding = await this.resolveClientBinding(actor, target);
        if (binding) {
            return binding;
        }

        const compiled = await actor.permissionEvaluator.compile({
            name: ANALYSIS_READ_PERMISSIONS,
            ...(target.realmAttributeName !== 'realmId' ? { realmAttributeName: target.realmAttributeName } : {}),
        });

        let grant: ICondition;
        switch (compiled.verdict) {
            case 'allow':
                return undefined;
            case 'deny':
                return matchNothing();
            case 'conditional':
                grant = compiled.condition;
                break;
            default:
                if (target.realmAttributeName !== 'realmId') {
                    // Naming a realm column makes authup refuse to lower ANY grant
                    // policy, so `post` here means "the grant carries a policy"; an
                    // own-realm fallback would show rows of analyses the policy
                    // hides on /analyses.
                    // ponytail: fail closed; derive the reach from the analysis
                    // reach (ids or a join) once policy-bearing grants are in use.
                    grant = matchNothing();
                    break;
                }

                // `post`: a grant policy that cannot lower — narrowed to the
                // actor's own realm, as scopeReadQuery does.
                grant = actor.realm ?
                    eq(target.realmAttributeName, actor.realm.id) :
                    matchNothing();
        }

        if (!actor.identity || actor.identity.type !== 'user' || !actor.realm) {
            return grant;
        }

        const ids = await this.analysisNodeRepository.findAnalysisIds({ nodeRealmId: actor.realm.id });
        if (ids.length === 0) {
            return grant;
        }

        return or(grant, inArray(target.analysisIdAttributeName, ids));
    }

    /** The reach of a node's or analysis' own client; `undefined` for any other identity. */
    protected async resolveClientBinding(
        actor: ActorContext,
        target: AnalysisReachTarget,
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
            const ids = await this.analysisNodeRepository.findAnalysisIds({ nodeId: node.id });
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
