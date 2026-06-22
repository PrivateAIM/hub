/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import { AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import { BuiltInPolicyType, PolicyData } from '@authup/access';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext } from '@privateaim/server-kit';
import { AbstractEntityService } from '@privateaim/server-kit';
import type { IAnalysisRepository } from '../../entities/analysis/types.ts';
import type { IAnalysisNodeRepository } from '../../entities/analysis-node/types.ts';
import type { INodeRepository } from '../../entities/node/types.ts';
import type {
    ClientCredentials,
    IAnalysisClientCredentialService,
    IClientCredentialStore,
} from './types.ts';

type AnalysisClientCredentialServiceContext = {
    repository: IAnalysisRepository;
    nodeRepository: INodeRepository;
    analysisNodeRepository: IAnalysisNodeRepository;
    credentialStore: IClientCredentialStore;
};

/**
 * Hands the credentials of an analysis' dedicated client to the parties allowed
 * to run it on the node side (plan 010, phase 3 — mechanism A, the pull path).
 * Authorization is fail-closed: only a master-realm member or the node that
 * actually runs the analysis may read the secret.
 */
export class AnalysisClientCredentialService extends AbstractEntityService implements IAnalysisClientCredentialService {
    protected repository: IAnalysisRepository;

    protected nodeRepository: INodeRepository;

    protected analysisNodeRepository: IAnalysisNodeRepository;

    protected credentialStore: IClientCredentialStore;

    constructor(ctx: AnalysisClientCredentialServiceContext) {
        super();
        this.repository = ctx.repository;
        this.nodeRepository = ctx.nodeRepository;
        this.analysisNodeRepository = ctx.analysisNodeRepository;
        this.credentialStore = ctx.credentialStore;
    }

    async getCredentials(analysisId: string, actor: ActorContext): Promise<ClientCredentials> {
        const analysis = await this.repository.findOneById(analysisId);
        if (!analysis) {
            throw new EntityNotFoundError({ entity: 'analysis' });
        }

        // Authorize before exposing provisioning state, so an unauthorized
        // caller can never infer it from BadRequest vs PermissionDenied. (The
        // existence 404 above is unavoidable — authorization needs the entity.)
        const authorized = await this.isAuthorized(analysis, actor);
        if (!authorized) {
            throw new PermissionDeniedError('You are not permitted to read the credentials of this analysis client.');
        }

        if (!analysis.client_id) {
            throw new BadRequestError('The analysis has no client provisioned yet.');
        }

        return this.credentialStore.readByClientId(analysis.client_id);
    }

    async setCredentials(
        analysisId: string,
        secret: string | undefined,
        actor: ActorContext,
    ): Promise<ClientCredentials> {
        // Writing is a manager action (ANALYSIS_UPDATE), not the read path's
        // master-or-assigned-node rule: the running analysis never rotates.
        await actor.permissionChecker.preCheck({ name: PermissionName.ANALYSIS_UPDATE });

        const analysis = await this.repository.findOneById(analysisId);
        if (!analysis) {
            throw new EntityNotFoundError({ entity: 'analysis' });
        }

        await actor.permissionChecker.check({
            name: PermissionName.ANALYSIS_UPDATE,
            input: new PolicyData({ [BuiltInPolicyType.ATTRIBUTES]: analysis }),
        });

        if (!isRealmResourceWritable(actor.realm, analysis.realm_id)) {
            throw new PermissionDeniedError('You are not permitted to write the credentials of this analysis client.');
        }

        if (!analysis.client_id) {
            throw new BadRequestError('The analysis has no client provisioned yet.');
        }

        return this.credentialStore.writeByClientId(analysis.client_id, secret);
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
