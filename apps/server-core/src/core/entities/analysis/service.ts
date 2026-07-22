/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import {
    AnalysisCommand,
    AnalysisNodeApprovalStatus,
    AnalysisValidator,
    NodeType,
    ProjectNodeApprovalStatus,
} from '@privateaim/core-kit';
import { BuiltInPolicyType, PolicyData } from '@authup/access';
import {
    PermissionName,
    ValidatorGroup,
    generateName,
    isRealmResourceWritable,
} from '@privateaim/kit';
import { isPropertySet } from '@authup/kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { AbstractEntityService } from '@privateaim/server-kit';
import type { IProjectRepository } from '../project/types.ts';
import type { IProjectNodeRepository } from '../project-node/types.ts';
import type { IAnalysisNodeMetadataRecalculator, IAnalysisNodeRepository } from '../analysis-node/types.ts';
import type { AnalysisBuilder } from '../../services/analysis-builder/index.ts';
import type { AnalysisConfigurator } from '../../services/analysis-configurator/index.ts';
import type { AnalysisDistributor } from '../../services/analysis-distributor/index.ts';
import type { AnalysisStorageManager } from '../../services/analysis-storage-manager/index.ts';
import { decodeQuery } from '../../query/index.ts';
import { analysisSchema } from './schema.ts';
import type { IAnalysisMetadataRecalculator, IAnalysisRepository, IAnalysisService } from './types.ts';

type AnalysisServiceContext = {
    repository: IAnalysisRepository;
    projectRepository: IProjectRepository;
    projectNodeRepository: IProjectNodeRepository;
    analysisNodeRepository: IAnalysisNodeRepository;
    builder: AnalysisBuilder;
    configurator: AnalysisConfigurator;
    distributor: AnalysisDistributor;
    storageManager: AnalysisStorageManager;
    recalculator: IAnalysisMetadataRecalculator;
    nodeRecalculator: IAnalysisNodeMetadataRecalculator;
    skipAnalysisApproval?: boolean;
};

export class AnalysisService extends AbstractEntityService implements IAnalysisService {
    protected repository: IAnalysisRepository;

    protected projectRepository: IProjectRepository;

    protected projectNodeRepository: IProjectNodeRepository;

    protected analysisNodeRepository: IAnalysisNodeRepository;

    protected builder: AnalysisBuilder;

    protected configurator: AnalysisConfigurator;

    protected distributor: AnalysisDistributor;

    protected storageManager: AnalysisStorageManager;

    protected recalculator: IAnalysisMetadataRecalculator;

    protected nodeRecalculator: IAnalysisNodeMetadataRecalculator;

    protected skipAnalysisApproval: boolean;

    protected validator: AnalysisValidator;

    constructor(ctx: AnalysisServiceContext) {
        super();
        this.repository = ctx.repository;
        this.projectRepository = ctx.projectRepository;
        this.projectNodeRepository = ctx.projectNodeRepository;
        this.analysisNodeRepository = ctx.analysisNodeRepository;
        this.builder = ctx.builder;
        this.configurator = ctx.configurator;
        this.distributor = ctx.distributor;
        this.storageManager = ctx.storageManager;
        this.recalculator = ctx.recalculator;
        this.nodeRecalculator = ctx.nodeRecalculator;
        this.skipAnalysisApproval = ctx.skipAnalysisApproval ?? false;
        this.validator = new AnalysisValidator();
    }

    async getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<Analysis>> {
        return this.repository.findMany(decodeQuery(query, { schema: analysisSchema }));
    }

    async getOne(id: string): Promise<Analysis> {
        const entity = await this.repository.findOneById(id);

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'analysis' });
        }

        return entity;
    }

    async create(data: Partial<Analysis>, actor: ActorContext): Promise<Analysis> {
        // The name is a URL-friendly identifier and required at the database
        // level. Generate one up-front when the caller did not provide a
        // (non-empty) name, so it passes validation instead of being rejected
        // as null/empty before generation could happen.
        const input: Partial<Analysis> = { ...data };
        if (!input.name) {
            input.name = generateName();
        }

        const validated = await this.validator.run(input, { group: ValidatorGroup.CREATE });

        await actor.permissionChecker.preCheck({ name: PermissionName.ANALYSIS_CREATE });

        await this.repository.validateJoinColumns(validated);

        if (!validated.master_image_id) {
            validated.master_image_id = validated.project.master_image_id;
        }

        validated.realm_id = validated.project.realm_id;

        if (!actor.identity || actor.identity.type !== 'user') {
            throw new PermissionDeniedError('Only user accounts are permitted to create an analysis.');
        }

        const entity = this.repository.create({ ...validated });

        entity.user_id = actor.identity.id;

        await actor.permissionChecker.check({
            name: PermissionName.ANALYSIS_CREATE,
            data: new PolicyData({ [BuiltInPolicyType.ATTRIBUTES]: entity }),
        });

        await this.repository.save(entity, { data: actor.metadata });

        // Derive the count from the actual rows instead of incrementing a stored
        // counter — the latter drifts out of sync (e.g. when a later step below
        // throws, or on concurrent creates) and can end up negative on delete.
        // This runs before the steps that may throw so the count stays accurate
        // even if the build/storage check fails after the analysis is persisted.
        entity.project.analyses = await this.repository.countByProject(entity.project_id);
        await this.projectRepository.save(entity.project, { data: actor.metadata });

        await this.assignProjectNodes(entity, actor);

        await this.recalculator.recalcDebounced(entity.id);

        await this.storageManager.check(entity);

        return entity;
    }

    /**
     * Assign the approved nodes of the analysis' project to the freshly created analysis.
     *
     * Only project nodes whose project membership is approved are assigned — nodes still
     * pending project approval are skipped. The resulting analysis-node still carries its
     * own per-analysis approval decision, mirroring {@see AnalysisNodeService.create}:
     * aggregator nodes (and all nodes when approval is skipped) are auto-approved,
     * otherwise the node starts pending. The node-derived analysis metadata is
     * recalculated once at the end instead of per node.
     */
    protected async assignProjectNodes(analysis: Analysis, actor: ActorContext): Promise<void> {
        const projectNodes = await this.projectNodeRepository.findManyWithNodeByProject(analysis.project_id);
        const approvedProjectNodes = projectNodes.filter(
            (projectNode) => projectNode.approval_status === ProjectNodeApprovalStatus.APPROVED,
        );
        if (approvedProjectNodes.length === 0) {
            return;
        }

        for (const projectNode of approvedProjectNodes) {
            const entity = this.analysisNodeRepository.create({
                analysis_id: analysis.id,
                analysis_realm_id: analysis.realm_id,
                node_id: projectNode.node_id,
                node_realm_id: projectNode.node_realm_id,
            });

            if (
                this.skipAnalysisApproval ||
                projectNode.node.type === NodeType.AGGREGATOR
            ) {
                entity.approval_status = AnalysisNodeApprovalStatus.APPROVED;
            }

            await this.analysisNodeRepository.save(entity, { data: actor.metadata });
        }

        await this.nodeRecalculator.recalc(analysis.id);
    }

    async update(id: string, data: Partial<Analysis>, actor: ActorContext): Promise<Analysis> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.UPDATE });

        await actor.permissionChecker.preCheck({ name: PermissionName.ANALYSIS_UPDATE });

        await this.repository.validateJoinColumns(validated);

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'analysis' });
        }

        await actor.permissionChecker.check({
            name: PermissionName.ANALYSIS_UPDATE,
            data: new PolicyData({ [BuiltInPolicyType.ATTRIBUTES]: entity }),
        });

        if (!isRealmResourceWritable(actor.realm, entity.realm_id)) {
            throw new PermissionDeniedError();
        }

        if (
            entity.registry_id &&
            validated.registry_id &&
            entity.registry_id !== validated.registry_id
        ) {
            throw new BadRequestError('The registry can not be changed after it is specified.');
        }

        if (isPropertySet(validated, 'master_image_id')) {
            if (validated.master_image_id !== entity.master_image_id) {
                validated.image_command_arguments = null;
            }
        }

        const merged = this.repository.merge(entity, validated);

        const saved = await this.repository.save(merged, { data: actor.metadata });

        await this.recalculator.recalcDebounced(saved.id);

        return saved;
    }

    async delete(id: string, actor: ActorContext): Promise<Analysis> {
        await actor.permissionChecker.preCheck({ name: PermissionName.ANALYSIS_DELETE });

        const entity = await this.repository.findOneWithProject(id);
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'analysis' });
        }

        await actor.permissionChecker.check({
            name: PermissionName.ANALYSIS_DELETE,
            data: new PolicyData({ [BuiltInPolicyType.ATTRIBUTES]: entity }),
        });

        if (!isRealmResourceWritable(actor.realm, entity.realm_id)) {
            throw new PermissionDeniedError();
        }

        const { project } = entity;
        const entityId = entity.id;

        await this.storageManager.remove(entity);

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        // Recompute from the actual rows rather than decrementing a stored counter,
        // which can drift below zero once it is out of sync.
        project.analyses = await this.repository.countByProject(project.id);
        await this.projectRepository.save(project, { data: actor.metadata });

        entity.project = project;

        return entity;
    }

    async executeCommand(id: string, command: `${AnalysisCommand}`, actor: ActorContext): Promise<Analysis> {
        if (!Object.values(AnalysisCommand).includes(command as AnalysisCommand)) {
            throw new BadRequestError('Invalid command.');
        }

        let entity = await this.getOne(id);

        if (!isRealmResourceWritable(actor.realm, entity.realm_id)) {
            throw new PermissionDeniedError();
        }

        const persistCtx = { data: actor.metadata };

        switch (command) {
            case AnalysisCommand.BUILD_CHECK:
                entity = await this.builder.check(entity);
                break;
            case AnalysisCommand.BUILD_START:
                entity = await this.builder.start(entity, persistCtx);
                break;
            case AnalysisCommand.CONFIGURATION_LOCK:
                entity = await this.configurator.lock(entity, {
                    ignoreApproval: this.skipAnalysisApproval,
                    persistCtx,
                });
                break;
            case AnalysisCommand.CONFIGURATION_UNLOCK:
                entity = await this.configurator.unlock(entity, {
                    ignoreApproval: this.skipAnalysisApproval,
                    persistCtx,
                });
                break;
            case AnalysisCommand.DISTRIBUTION_CHECK:
                entity = await this.distributor.check(entity);
                break;
            case AnalysisCommand.DISTRIBUTION_START:
                entity = await this.distributor.start(entity, persistCtx);
                break;
            case AnalysisCommand.STORAGE_CHECK:
                entity = await this.storageManager.check(entity);
                break;
        }

        return entity;
    }
}
