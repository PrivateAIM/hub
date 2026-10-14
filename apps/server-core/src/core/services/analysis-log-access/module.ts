/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import { EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext } from '@privateaim/server-kit';
import type { IAnalysisRepository } from '../../entities/analysis/types.ts';
import type { INodeRepository } from '../../entities/node/types.ts';
import { holdsPermission } from '../../utils/index.ts';
import { LogAccessIntent } from './constants.ts';
import type { IAnalysisLogAccessService } from './types.ts';

type AnalysisLogAccessServiceContext = {
    analysisRepository: IAnalysisRepository;
    nodeRepository: INodeRepository;
};

/**
 * The rules mirror the writes the logs belong to:
 *
 * - **Analysis logs** are the analysis' own record. Reading needs realm
 *   authority over the analysis; deleting is an analysis update, so it
 *   additionally needs ANALYSIS_UPDATE — the same pair `AnalysisService.update`
 *   enforces.
 * - **Analysis-node logs** are written by the node side (`POST` requires
 *   realm authority over the node). Either side of the run may read them —
 *   realm authority over the node OR the analysis, the rule
 *   `AnalysisNodeService.update` applies. Deleting is open to the node side
 *   that wrote them, or to an analysis manager (ANALYSIS_UPDATE with realm
 *   authority over the analysis).
 *
 * A master-realm member holds realm authority over every realm
 * (`isRealmResourceWritable`).
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

        if (intent === LogAccessIntent.DELETE) {
            await actor.permissionEvaluator.preEvaluate({ name: PermissionName.ANALYSIS_UPDATE });
        }

        if (!isRealmResourceWritable(actor.realm, analysis.realmId)) {
            throw new PermissionDeniedError('You are not permitted to access the logs of this analysis.');
        }
    }

    async assertAnalysisNodeLogAccess(
        analysisId: string,
        nodeId: string,
        actor: ActorContext,
        intent: `${LogAccessIntent}`,
    ): Promise<void> {
        const analysis = await this.findAnalysis(analysisId);

        const node = await this.nodeRepository.findOneById(nodeId);
        if (!node) {
            throw new EntityNotFoundError({ entity: 'node' });
        }

        if (isRealmResourceWritable(actor.realm, node.realmId)) {
            return;
        }

        const isAuthorityOfAnalysis = isRealmResourceWritable(actor.realm, analysis.realmId);
        if (isAuthorityOfAnalysis) {
            if (intent === LogAccessIntent.READ) {
                return;
            }

            if (await holdsPermission(actor, PermissionName.ANALYSIS_UPDATE)) {
                return;
            }
        }

        throw new PermissionDeniedError('You are not permitted to access the logs of this analysis node.');
    }

    protected async findAnalysis(id: string): Promise<Analysis> {
        const analysis = await this.analysisRepository.findOneById(id);
        if (!analysis) {
            throw new EntityNotFoundError({ entity: 'analysis' });
        }

        return analysis;
    }
}
