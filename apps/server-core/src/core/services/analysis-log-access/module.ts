/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuiltInPolicyType, PolicyData } from '@authup/access';
import type { Analysis, Node } from '@privateaim/core-kit';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext } from '@privateaim/server-kit';
import { z } from 'zod';
import type { IAnalysisRepository } from '../../entities/analysis/types.ts';
import type { INodeRepository } from '../../entities/node/types.ts';
import { holdsPermission } from '../../utils/index.ts';
import { LogAccessIntent } from './constants.ts';
import type { AnalysisLogAccessServiceContext, IAnalysisLogAccessService } from './types.ts';

/**
 * The rules mirror the writes the logs belong to:
 *
 * - **Reading** needs realm authority over the analysis (analysis logs) or
 *   over the node OR the analysis (analysis-node logs — either side of the
 *   run). No read permission: hub has none for analyses (plan 016, F18), so
 *   this matches how the analysis itself is read.
 * - **Deleting** is an analysis update — ANALYSIS_UPDATE, fully evaluated
 *   against the analysis (attribute policies included), as
 *   `AnalysisService.update` and the node side's execution-status update in
 *   `AnalysisNodeService.update` require — plus the same realm authority.
 *   Realm membership alone never deletes: a master-realm member holds
 *   authority over every realm.
 */
export class AnalysisLogAccessService implements IAnalysisLogAccessService {
    protected analysisRepository: IAnalysisRepository;

    protected nodeRepository: INodeRepository;

    constructor(ctx: AnalysisLogAccessServiceContext) {
        this.analysisRepository = ctx.analysisRepository;
        this.nodeRepository = ctx.nodeRepository;
    }

    async assertAnalysisLogAccess(
        analysisId: string,
        actor: ActorContext,
        intent: `${LogAccessIntent}`,
    ): Promise<void> {
        const analysis = await this.findAnalysis(analysisId);

        if (!isRealmResourceWritable(actor.realm, analysis.realmId)) {
            throw new PermissionDeniedError('You are not permitted to access the logs of this analysis.');
        }

        if (intent === LogAccessIntent.DELETE) {
            await this.assertAnalysisUpdate(analysis, actor);
        }
    }

    async assertAnalysisNodeLogAccess(
        analysisId: string,
        nodeId: string,
        actor: ActorContext,
        intent: `${LogAccessIntent}`,
    ): Promise<void> {
        const [analysis, node] = await Promise.all([
            this.findAnalysis(analysisId),
            this.findNode(nodeId),
        ]);

        if (
            !isRealmResourceWritable(actor.realm, node.realmId) &&
            !isRealmResourceWritable(actor.realm, analysis.realmId)
        ) {
            throw new PermissionDeniedError('You are not permitted to access the logs of this analysis node.');
        }

        if (intent === LogAccessIntent.DELETE) {
            await this.assertAnalysisUpdate(analysis, actor);
        }
    }

    protected async assertAnalysisUpdate(analysis: Analysis, actor: ActorContext): Promise<void> {
        const permitted = await holdsPermission(
            actor,
            PermissionName.ANALYSIS_UPDATE,
            new PolicyData({ [BuiltInPolicyType.ATTRIBUTES]: analysis }),
        );
        if (!permitted) {
            throw new PermissionDeniedError('You are not permitted to delete these logs.');
        }
    }

    protected async findAnalysis(id: string): Promise<Analysis> {
        assertUUID(id, 'analysisId');

        const analysis = await this.analysisRepository.findOneById(id);
        if (!analysis) {
            throw new EntityNotFoundError({ entity: 'analysis' });
        }

        return analysis;
    }

    protected async findNode(id: string): Promise<Node> {
        assertUUID(id, 'nodeId');

        const node = await this.nodeRepository.findOneById(id);
        if (!node) {
            throw new EntityNotFoundError({ entity: 'node' });
        }

        return node;
    }
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
