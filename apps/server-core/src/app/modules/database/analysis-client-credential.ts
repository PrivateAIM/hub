/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import { AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext, AuthupClient } from '@privateaim/server-kit';
import { AbstractEntityService } from '@privateaim/server-kit';
import type {
    IAnalysisNodeRepository,
    IAnalysisRepository,
    INodeRepository,
} from '../../../core/index.ts';

export type AnalysisClientCredentials = {
    id: string;
    secret: string | null;
};

type AnalysisClientCredentialServiceContext = {
    authup: AuthupClient;
    analysisRepository: IAnalysisRepository;
    nodeRepository: INodeRepository;
    analysisNodeRepository: IAnalysisNodeRepository;
};

/**
 * Hands the credentials of an analysis' dedicated client to the parties allowed
 * to run it on the node side (plan 010, phase 3 — mechanism A, the pull path).
 * Authorization is fail-closed: only a master-realm member or the node that
 * actually runs the analysis may read the secret.
 */
export class AnalysisClientCredentialService extends AbstractEntityService {
    protected authup: AuthupClient;

    protected analysisRepository: IAnalysisRepository;

    protected nodeRepository: INodeRepository;

    protected analysisNodeRepository: IAnalysisNodeRepository;

    constructor(ctx: AnalysisClientCredentialServiceContext) {
        super();
        this.authup = ctx.authup;
        this.analysisRepository = ctx.analysisRepository;
        this.nodeRepository = ctx.nodeRepository;
        this.analysisNodeRepository = ctx.analysisNodeRepository;
    }

    async getCredentials(analysisId: string, actor: ActorContext): Promise<AnalysisClientCredentials> {
        const analysis = await this.analysisRepository.findOneById(analysisId);
        if (!analysis) {
            throw new EntityNotFoundError({ entity: 'analysis' });
        }

        if (!analysis.client_id) {
            throw new BadRequestError('The analysis has no client provisioned yet.');
        }

        const authorized = await this.isAuthorized(analysis, actor);
        if (!authorized) {
            throw new PermissionDeniedError('You are not permitted to read the credentials of this analysis client.');
        }

        const client = await this.authup.client.getOne(analysis.client_id, { fields: ['+secret'] });

        return {
            id: client.id,
            secret: client.secret ?? null,
        };
    }

    /**
     * Fail-closed: a master-realm member (admin/ops) may always read; otherwise
     * the actor must be the client of a node that is assigned to this analysis
     * with an APPROVED analysis-node link. Everything else is denied.
     */
    protected async isAuthorized(analysis: Analysis, actor: ActorContext): Promise<boolean> {
        if (this.isActorMasterRealmMember(actor)) {
            return true;
        }

        if (!actor.identity || actor.identity.type !== 'client') {
            return false;
        }

        const node = await this.nodeRepository.findOneBy({ client_id: actor.identity.id });
        if (!node) {
            return false;
        }

        const analysisNode = await this.analysisNodeRepository.findOneBy({
            analysis_id: analysis.id,
            node_id: node.id,
        });

        return !!analysisNode && analysisNode.approval_status === AnalysisNodeApprovalStatus.APPROVED;
    }
}
