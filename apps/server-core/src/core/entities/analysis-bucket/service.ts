/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucket } from '@privateaim/core-kit';
import { isRealmResourceWritable } from '@privateaim/kit';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import type { ActorContext } from '../actor/types.ts';
import type { EntityRepositoryFindManyResult } from '../types.ts';
import { ValidatorGroup } from '../constants.ts';
import { AbstractEntityService } from '../service.ts';
import type { IAnalysisBucketRepository, IAnalysisBucketService } from './types.ts';
import { AnalysisBucketValidator } from './validator.ts';

type AnalysisBucketServiceContext = {
    repository: IAnalysisBucketRepository;
};

export class AnalysisBucketService extends AbstractEntityService implements IAnalysisBucketService {
    protected repository: IAnalysisBucketRepository;

    protected validator: AnalysisBucketValidator;

    constructor(ctx: AnalysisBucketServiceContext) {
        super();
        this.repository = ctx.repository;
        this.validator = new AnalysisBucketValidator();
    }

    async getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<AnalysisBucket>> {
        return this.repository.findMany(query);
    }

    async getOne(id: string): Promise<AnalysisBucket> {
        const entity = await this.repository.findOneById(id);

        if (!entity) {
            throw new NotFoundError();
        }

        return entity;
    }

    async create(data: Partial<AnalysisBucket>, actor: ActorContext): Promise<AnalysisBucket> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        await this.repository.validateJoinColumns(validated);

        validated.realm_id = validated.analysis.realm_id;

        const entity = this.repository.create(validated);

        return this.repository.save(entity, { data: actor.metadata });
    }

    async update(id: string, data: Partial<AnalysisBucket>, actor: ActorContext): Promise<AnalysisBucket> {
        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new NotFoundError();
        }

        if (!isRealmResourceWritable(actor.realm, entity.realm_id)) {
            throw new ForbiddenError();
        }

        const validated = await this.validator.run(data, { group: ValidatorGroup.UPDATE });

        const merged = this.repository.merge(entity, validated);

        return this.repository.save(merged, { data: actor.metadata });
    }

    async delete(id: string, actor: ActorContext): Promise<AnalysisBucket> {
        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new NotFoundError();
        }

        if (!isRealmResourceWritable(actor.realm, entity.realm_id)) {
            throw new ForbiddenError();
        }

        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        return entity;
    }
}
