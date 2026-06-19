/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import type { ClientPermission } from '@authup/core-kit';
import { BuiltInPolicyType, PolicyData } from '@authup/access';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext, AuthupClient } from '@privateaim/server-kit';
import type { IAnalysisRepository } from '../../../core/index.ts';

/**
 * Capabilities that may be granted to an analysis' dedicated client. Restricting
 * grants to this family means an analysis client can never be handed a broad
 * permission (e.g. ANALYSIS_APPROVE) through this admin surface — it can only
 * ever receive the self-scoped capabilities it uses on the node side.
 */
const ANALYSIS_SELF_PERMISSION_NAMES: string[] = [
    PermissionName.ANALYSIS_SELF_STORAGE_USE,
    PermissionName.ANALYSIS_SELF_MESSAGE_BROKER_USE,
];

type AnalysisClientPermissionServiceContext = {
    authup: AuthupClient;
    analysisRepository: IAnalysisRepository;
};

/**
 * Manages the client-permission assignments of an analysis' dedicated Authup
 * client (plan 010, phase 2). The analysis client itself is the source of truth
 * — there is no hub-side join entity — so this is a thin, guarded pass-through
 * to Authup's clientPermission API, constrained to the analysis-self family.
 */
export class AnalysisClientPermissionService {
    protected authup: AuthupClient;

    protected analysisRepository: IAnalysisRepository;

    constructor(ctx: AnalysisClientPermissionServiceContext) {
        this.authup = ctx.authup;
        this.analysisRepository = ctx.analysisRepository;
    }

    protected async resolveAnalysis(analysisId: string): Promise<Analysis> {
        const analysis = await this.analysisRepository.findOneById(analysisId);
        if (!analysis) {
            throw new EntityNotFoundError({ entity: 'analysis' });
        }

        return analysis;
    }

    /**
     * Gate writes: the actor must hold ANALYSIS_UPDATE (globally and for this
     * analysis' attributes), be allowed to write the analysis' realm, the
     * analysis must not be configuration-locked, and a client must exist.
     */
    protected async assertWritable(analysis: Analysis, actor: ActorContext): Promise<void> {
        await actor.permissionChecker.preCheck({ name: PermissionName.ANALYSIS_UPDATE });
        await actor.permissionChecker.check({
            name: PermissionName.ANALYSIS_UPDATE,
            input: new PolicyData({ [BuiltInPolicyType.ATTRIBUTES]: analysis }),
        });

        if (!isRealmResourceWritable(actor.realm, analysis.realm_id)) {
            throw new PermissionDeniedError();
        }

        if (analysis.configuration_locked) {
            throw new BadRequestError('The capabilities cannot be changed while the analysis configuration is locked.');
        }

        if (!analysis.client_id) {
            throw new BadRequestError('The analysis has no client provisioned yet.');
        }
    }

    async getMany(analysisId: string, actor: ActorContext) {
        const analysis = await this.resolveAnalysis(analysisId);

        // Viewing the capability assignments exposes the analysis' security
        // configuration, so it requires the same permission as changing it.
        await actor.permissionChecker.preCheck({ name: PermissionName.ANALYSIS_UPDATE });

        if (!analysis.client_id) {
            return { data: [], meta: { total: 0 } };
        }

        const { data, meta } = await this.authup.clientPermission.getMany({
            filter: { client_id: analysis.client_id },
            relations: { permission: true },
        });

        return { data, meta };
    }

    async create(analysisId: string, data: { permission_id?: string }, actor: ActorContext): Promise<ClientPermission> {
        if (!data.permission_id) {
            throw new BadRequestError('A permission_id is required.');
        }

        const analysis = await this.resolveAnalysis(analysisId);
        await this.assertWritable(analysis, actor);

        const permission = await this.authup.permission.getOne(data.permission_id);
        if (!ANALYSIS_SELF_PERMISSION_NAMES.includes(permission.name)) {
            throw new PermissionDeniedError('Only analysis self-capabilities can be assigned to an analysis client.');
        }

        return this.authup.clientPermission.create({
            client_id: analysis.client_id,
            permission_id: permission.id,
        });
    }

    async delete(analysisId: string, permissionId: string, actor: ActorContext): Promise<ClientPermission> {
        const analysis = await this.resolveAnalysis(analysisId);
        await this.assertWritable(analysis, actor);

        const { data } = await this.authup.clientPermission.getMany({ filter: { client_id: analysis.client_id, permission_id: permissionId } });

        const [clientPermission] = data;
        if (!clientPermission) {
            throw new EntityNotFoundError({ entity: 'clientPermission' });
        }

        await this.authup.clientPermission.delete(clientPermission.id);

        return clientPermission;
    }
}
