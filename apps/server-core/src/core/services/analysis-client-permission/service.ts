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
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import type { IAnalysisRepository } from '../../entities/analysis/types.ts';
import type { IAnalysisClientPermissionService, IClientPermissionStore } from './types.ts';

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
    store: IClientPermissionStore;
    analysisRepository: IAnalysisRepository;
};

/**
 * Manages the client-permission assignments of an analysis' dedicated Authup
 * client (plan 010, phase 2). The analysis client itself is the source of truth
 * — there is no hub-side join entity — so this is a thin, guarded pass-through
 * to the client-permission store, constrained to the analysis-self family.
 */
export class AnalysisClientPermissionService implements IAnalysisClientPermissionService {
    protected store: IClientPermissionStore;

    protected analysisRepository: IAnalysisRepository;

    constructor(ctx: AnalysisClientPermissionServiceContext) {
        this.store = ctx.store;
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
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.ANALYSIS_UPDATE });
        // The attribute bag is keyed by the entity's camelCase property names
        // (#1806), but the policies matching on them live in Authup's database.
        // A deployed policy still matching `realm_id`/`configuration_locked`
        // silently stops matching, and a denylist-shaped one then fails OPEN.
        // See docs/src/guide/development/migration-camelcase.md ->
        // "Authup attribute policies".
        await actor.permissionEvaluator.evaluate({
            name: PermissionName.ANALYSIS_UPDATE,
            data: new PolicyData({ [BuiltInPolicyType.ATTRIBUTES]: analysis }),
        });

        if (!isRealmResourceWritable(actor.realm, analysis.realmId)) {
            throw new PermissionDeniedError();
        }

        if (analysis.configurationLocked) {
            throw new BadRequestError('The capabilities cannot be changed while the analysis configuration is locked.');
        }

        if (!analysis.clientId) {
            throw new BadRequestError('The analysis has no client provisioned yet.');
        }
    }

    async getMany(analysisId: string, actor: ActorContext): Promise<EntityRepositoryFindManyResult<ClientPermission>> {
        const analysis = await this.resolveAnalysis(analysisId);

        // Viewing the capability assignments exposes the analysis' security
        // configuration, so it requires the same permission as changing it.
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.ANALYSIS_UPDATE });

        if (!analysis.clientId) {
            return { data: [], meta: { total: 0 } };
        }

        return this.store.getManyByClientId(analysis.clientId);
    }

    async create(analysisId: string, data: { permissionId?: string }, actor: ActorContext): Promise<ClientPermission> {
        if (!data.permissionId) {
            throw new BadRequestError('A permissionId is required.');
        }

        const analysis = await this.resolveAnalysis(analysisId);
        await this.assertWritable(analysis, actor);

        const permission = await this.store.getPermission(data.permissionId);
        if (!ANALYSIS_SELF_PERMISSION_NAMES.includes(permission.name)) {
            throw new PermissionDeniedError('Only analysis self-capabilities can be assigned to an analysis client.');
        }

        return this.store.create(analysis.clientId, permission.id);
    }

    async delete(analysisId: string, permissionId: string, actor: ActorContext): Promise<ClientPermission> {
        const analysis = await this.resolveAnalysis(analysisId);
        await this.assertWritable(analysis, actor);

        const clientPermission = await this.store.findOne(analysis.clientId, permissionId);
        if (!clientPermission) {
            throw new EntityNotFoundError({ entity: 'clientPermission' });
        }

        await this.store.delete(clientPermission.id);

        return clientPermission;
    }
}
