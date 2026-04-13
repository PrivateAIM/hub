/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import { BuiltInPolicyType, PolicyData } from '@authup/access';
import {
    PermissionName,
    isRealmResourceWritable,
} from '@privateaim/kit';
import { isPropertySet } from '@authup/kit';
import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import type { ActorContext } from '../actor/types.ts';
import type { EntityRepositoryFindManyResult } from '../types.ts';
import { ValidatorGroup } from '../constants.ts';
import { AbstractEntityService } from '../service.ts';
import type { IProjectRepository } from '../project/types.ts';
import type { IAnalysisRepository, IAnalysisService } from './types.ts';
import { AnalysisValidator } from './validator.ts';

type AnalysisServiceContext = {
    repository: IAnalysisRepository;
    projectRepository: IProjectRepository;
};

export class AnalysisService extends AbstractEntityService implements IAnalysisService {
    protected repository: IAnalysisRepository;

    protected projectRepository: IProjectRepository;

    protected validator: AnalysisValidator;

    constructor(ctx: AnalysisServiceContext) {
        super();
        this.repository = ctx.repository;
        this.projectRepository = ctx.projectRepository;
        this.validator = new AnalysisValidator();
    }

    async getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<Analysis>> {
        return this.repository.findMany(query);
    }

    async getOne(id: string): Promise<Analysis> {
        const entity = await this.repository.findOneById(id);

        if (!entity) {
            throw new NotFoundError();
        }

        return entity;
    }

    async create(data: Partial<Analysis>, actor: ActorContext): Promise<Analysis> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        await actor.permissionChecker.preCheck({ name: PermissionName.ANALYSIS_CREATE });

        await this.repository.validateJoinColumns(validated);

        if (!validated.master_image_id) {
            validated.master_image_id = validated.project.master_image_id;
        }

        validated.realm_id = validated.project.realm_id;

        if (!actor.identity || actor.identity.type !== 'user') {
            throw new ForbiddenError('Only user accounts are permitted to create an analysis.');
        }

        const entity = this.repository.create({
            realm_id: actor.identity.attributes?.realmId,
            ...validated,
        });

        entity.user_id = actor.identity.id;

        await actor.permissionChecker.check({
            name: PermissionName.ANALYSIS_CREATE,
            input: new PolicyData({ [BuiltInPolicyType.ATTRIBUTES]: entity }),
        });

        await this.repository.save(entity, { data: actor.metadata });

        entity.project.analyses++;
        await this.projectRepository.save(entity.project, { data: actor.metadata });

        return entity;
    }

    async update(id: string, data: Partial<Analysis>, actor: ActorContext): Promise<Analysis> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.UPDATE });

        await actor.permissionChecker.preCheck({ name: PermissionName.ANALYSIS_UPDATE });

        await this.repository.validateJoinColumns(validated);

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new NotFoundError();
        }

        await actor.permissionChecker.check({
            name: PermissionName.ANALYSIS_UPDATE,
            input: new PolicyData({ [BuiltInPolicyType.ATTRIBUTES]: entity }),
        });

        if (!isRealmResourceWritable(actor.realm, entity.realm_id)) {
            throw new ForbiddenError();
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

        return this.repository.save(merged, { data: actor.metadata });
    }

    async delete(id: string, actor: ActorContext): Promise<Analysis> {
        await actor.permissionChecker.preCheck({ name: PermissionName.ANALYSIS_DELETE });

        const entity = await this.repository.findOneWithProject(id);
        if (!entity) {
            throw new NotFoundError();
        }

        await actor.permissionChecker.check({
            name: PermissionName.ANALYSIS_DELETE,
            input: new PolicyData({ [BuiltInPolicyType.ATTRIBUTES]: entity }),
        });

        if (!isRealmResourceWritable(actor.realm, entity.realm_id)) {
            throw new ForbiddenError();
        }

        const { project } = entity;
        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        project.analyses--;
        await this.projectRepository.save(project, { data: actor.metadata });

        entity.project = project;

        return entity;
    }
}
