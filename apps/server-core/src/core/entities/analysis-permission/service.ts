/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisPermission } from '@privateaim/core-kit';
import {
    PermissionName,
    isRealmResourceWritable,
} from '@privateaim/kit';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { AbstractEntityService, ValidatorGroup } from '@privateaim/server-kit';
import type { IAnalysisPermissionRepository, IAnalysisPermissionService } from './types.ts';
import { AnalysisPermissionValidator } from './validator.ts';

type AnalysisPermissionServiceContext = {
    repository: IAnalysisPermissionRepository;
};

export class AnalysisPermissionService extends AbstractEntityService implements IAnalysisPermissionService {
    protected repository: IAnalysisPermissionRepository;

    protected validator: AnalysisPermissionValidator;

    constructor(ctx: AnalysisPermissionServiceContext) {
        super();
        this.repository = ctx.repository;
        this.validator = new AnalysisPermissionValidator();
    }

    async getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<AnalysisPermission>> {
        return this.repository.findMany(query);
    }

    async getOne(id: string): Promise<AnalysisPermission> {
        const entity = await this.repository.findOneById(id);

        if (!entity) {
            throw new NotFoundError();
        }

        return entity;
    }

    async create(data: Partial<AnalysisPermission>, actor: ActorContext): Promise<AnalysisPermission> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        await actor.permissionChecker.preCheck({ name: PermissionName.ANALYSIS_UPDATE });

        await this.repository.validateJoinColumns(validated);

        validated.analysis_realm_id = validated.analysis.realm_id;

        const entity = this.repository.create(validated);

        return this.repository.save(entity, { data: actor.metadata });
    }

    async delete(id: string, actor: ActorContext): Promise<AnalysisPermission> {
        await actor.permissionChecker.preCheck({ name: PermissionName.ANALYSIS_UPDATE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new NotFoundError();
        }

        if (!isRealmResourceWritable(actor.realm, entity.analysis_realm_id)) {
            throw new ForbiddenError();
        }

        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        return entity;
    }
}
