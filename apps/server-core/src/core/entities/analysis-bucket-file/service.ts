/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucketFile } from '@privateaim/core-kit';
import { ValidatorGroup, isRealmResourceWritable  } from '@privateaim/kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { AbstractEntityService } from '@privateaim/server-kit';
import type { IAnalysisBucketFileRepository, IAnalysisBucketFileService, IAnalysisFileMetadataRecalculator } from './types.ts';
import { AnalysisBucketFileValidator } from '@privateaim/core-kit';
import { decodeQuery } from '../../query/index.ts';
import { analysisBucketFileSchema } from './schema.ts';

type AnalysisBucketFileServiceContext = {
    repository: IAnalysisBucketFileRepository;
    recalculator: IAnalysisFileMetadataRecalculator;
};

export class AnalysisBucketFileService extends AbstractEntityService implements IAnalysisBucketFileService {
    protected repository: IAnalysisBucketFileRepository;

    protected recalculator: IAnalysisFileMetadataRecalculator;

    protected validator: AnalysisBucketFileValidator;

    constructor(ctx: AnalysisBucketFileServiceContext) {
        super();
        this.repository = ctx.repository;
        this.recalculator = ctx.recalculator;
        this.validator = new AnalysisBucketFileValidator();
    }

    async getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<AnalysisBucketFile>> {
        return this.repository.findMany(decodeQuery(query, { schema: analysisBucketFileSchema }));
    }

    async getOne(id: string): Promise<AnalysisBucketFile> {
        const entity = await this.repository.findOneById(id);

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'analysis-bucket-file' });
        }

        return entity;
    }

    async create(data: Partial<AnalysisBucketFile>, actor: ActorContext): Promise<AnalysisBucketFile> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        if (!actor.identity) {
            throw new BadRequestError('An identity is required.');
        }

        await this.repository.validateJoinColumns(validated);

        validated.realmId = this.getActorRealmId(actor);

        if (!isRealmResourceWritable(actor.realm, validated.realmId)) {
            throw new PermissionDeniedError();
        }

        // Set analysisId from the related analysisBucket
        if (validated.analysisBucket?.analysisId) {
            validated.analysisId = validated.analysisBucket.analysisId;
        }

        switch (actor.identity.type) {
            case 'user': {
                validated.userId = actor.identity.id;
                break;
            }
            case 'robot': {
                validated.robotId = actor.identity.id;
                break;
            }
            case 'client': {
                validated.clientId = actor.identity.id;
                break;
            }
            default: {
                throw new BadRequestError('Only client-, user- or robot-accounts are permitted.');
            }
        }

        const entity = this.repository.create(validated);

        const saved = await this.repository.save(entity, { data: actor.metadata });

        if (saved.root) {
            await this.recalculator.recalc(saved.analysisId);
        }

        return saved;
    }

    async update(id: string, data: Partial<AnalysisBucketFile>, actor: ActorContext): Promise<AnalysisBucketFile> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.UPDATE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'analysis-bucket-file' });
        }

        if (!isRealmResourceWritable(actor.realm, entity.realmId)) {
            throw new PermissionDeniedError();
        }

        const merged = this.repository.merge(entity, validated);

        const saved = await this.repository.save(merged, { data: actor.metadata });

        await this.recalculator.recalcDebounced(saved.analysisId);

        return saved;
    }

    async delete(id: string, actor: ActorContext): Promise<AnalysisBucketFile> {
        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'analysis-bucket-file' });
        }

        if (!isRealmResourceWritable(actor.realm, entity.realmId)) {
            throw new PermissionDeniedError();
        }

        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        if (entity.root) {
            await this.recalculator.recalc(entity.analysisId);
        }

        return entity;
    }
}
