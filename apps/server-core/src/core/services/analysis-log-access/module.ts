/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ICondition } from '@rapiq/core';
import { Query, eq } from '@rapiq/core';
import type { Node } from '@privateaim/core-kit';
import { AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import { BadRequestError, EntityNotFoundError } from '@privateaim/errors';
import type { ActorContext } from '@privateaim/server-kit';
import { appendQueryConditions } from '@privateaim/server-kit';
import { z } from 'zod';
import type { IAnalysisRepository } from '../../entities/analysis/types.ts';
import type { IAnalysisNodeRepository } from '../../entities/analysis-node/types.ts';
import type { INodeRepository } from '../../entities/node/types.ts';
import type { AnalysisReachTarget, IAnalysisReachService } from '../analysis-reach/index.ts';
import { LogAccessIntent } from './constants.ts';
import type { AnalysisLogAccessServiceContext, IAnalysisLogAccessService } from './types.ts';

const REACH_TARGET: AnalysisReachTarget = { analysisPath: '', analysisIdAttributeName: 'id' };

/** The node's operators (plan 021, D6). */
const ANALYSIS_NODE_LOG_PERMISSIONS = [PermissionName.ANALYSIS_UPDATE, PermissionName.ANALYSIS_APPROVE];

/**
 * Plan 021, D2/D3/D6:
 *
 * - **Analysis logs** are read with the analysis read one-of by the owner
 *   side (the grant's reach) and every approved node.
 * - **Analysis-node logs** are read with ANALYSIS_UPDATE or ANALYSIS_APPROVE
 *   by the owner side (every node) and by that node itself — its realm's users
 *   or its own client — once approved.
 * - **Deleting** either is the owner side's alone: ANALYSIS_UPDATE through the
 *   grant's reach, never through participation.
 *
 * Out of reach answers 404, like a missing analysis.
 */
export class AnalysisLogAccessService implements IAnalysisLogAccessService {
    protected analysisRepository: IAnalysisRepository;

    protected analysisNodeRepository: IAnalysisNodeRepository;

    protected nodeRepository: INodeRepository;

    protected reach: IAnalysisReachService;

    constructor(ctx: AnalysisLogAccessServiceContext) {
        this.analysisRepository = ctx.analysisRepository;
        this.analysisNodeRepository = ctx.analysisNodeRepository;
        this.nodeRepository = ctx.nodeRepository;
        this.reach = ctx.reach;
    }

    async assertAnalysisLogAccess(
        analysisId: string,
        actor: ActorContext,
        intent: `${LogAccessIntent}`,
    ): Promise<void> {
        assertUUID(analysisId, 'analysisId');

        const condition = intent === LogAccessIntent.DELETE ?
            await this.reach.resolve(actor, REACH_TARGET, { names: [PermissionName.ANALYSIS_UPDATE], grantOnly: true }) :
            await this.reach.resolve(actor, REACH_TARGET, { approvedOnly: true });

        if (!await this.reaches(analysisId, condition)) {
            throw new EntityNotFoundError({ entity: 'analysis' });
        }
    }

    async assertAnalysisNodeLogAccess(
        analysisId: string,
        nodeId: string,
        actor: ActorContext,
        intent: `${LogAccessIntent}`,
    ): Promise<void> {
        assertUUID(analysisId, 'analysisId');
        assertUUID(nodeId, 'nodeId');

        if (intent === LogAccessIntent.DELETE) {
            await this.assertAnalysisLogAccess(analysisId, actor, intent);
            await this.findNode(nodeId);
            return;
        }

        // The capability first: without it, an unknown node must not answer
        // differently from a known one.
        await actor.permissionEvaluator.preEvaluateOneOf({ name: ANALYSIS_NODE_LOG_PERMISSIONS });

        const node = await this.findNode(nodeId);

        const owner = await this.reach.resolve(actor, REACH_TARGET, { names: ANALYSIS_NODE_LOG_PERMISSIONS, grantOnly: true });
        if (await this.reaches(analysisId, owner)) {
            return;
        }

        if (isActingAsNode(actor, node)) {
            const row = await this.analysisNodeRepository.findOneBy({
                analysisId,
                nodeId,
                approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
            });
            if (row) {
                return;
            }
        }

        throw new EntityNotFoundError({ entity: 'analysis' });
    }

    protected async findNode(id: string): Promise<Node> {
        const node = await this.nodeRepository.findOneById(id);
        if (!node) {
            throw new EntityNotFoundError({ entity: 'node' });
        }

        return node;
    }

    protected async reaches(analysisId: string, condition: ICondition | undefined): Promise<boolean> {
        const conditions = condition ? [condition, eq('id', analysisId)] : [eq('id', analysisId)];
        const { data } = await this.analysisRepository.findMany(appendQueryConditions(new Query({}), ...conditions));

        return data.length > 0;
    }
}

/**
 * A user of the node's realm, or the node's own client — bound in its own
 * realm only, since `node.clientId` is writable by node managers (as in
 * `AnalysisReachService`).
 */
function isActingAsNode(actor: ActorContext, node: Node): boolean {
    if (!actor.identity) {
        return false;
    }

    if (actor.identity.type === 'user') {
        return !!actor.realm && actor.realm.id === node.realmId;
    }

    return node.clientId === actor.identity.id && node.realmId === actor.identity.realmId;
}

/**
 * The ids arrive as raw filter values. On postgres a non-UUID compared
 * against a `uuid` column is a driver error (a 500), not "not found".
 */
function assertUUID(value: string, field: string): void {
    if (!z.uuid().safeParse(value).success) {
        throw new BadRequestError(`The filter ${field} must be a UUID.`);
    }
}
