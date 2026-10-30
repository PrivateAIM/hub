/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@privateaim/errors';
import type { Analysis, AnalysisBucket } from '@privateaim/core-kit';
import { AnalysisBucketType, DomainType, buildAnalysisBucketName } from '@privateaim/core-kit';
import type { IEntityRepository } from '@privateaim/server-kit';
import type {
    AnalysisStorageMangerCheckOptions,
    AnalysisStorageMangerClearOptions,
    AnalysisStorageMangerRemoveOptions,
    IAnalysisStorageManager,
    IBucketDispatcher,
} from './types.ts';

type AnalysisStorageManagerContext = {
    repository: IEntityRepository<Analysis>;
    bucketRepository: IEntityRepository<AnalysisBucket>;
    dispatcher: IBucketDispatcher;
};

export class AnalysisStorageManager implements IAnalysisStorageManager {
    protected repository: IEntityRepository<Analysis>;

    protected bucketRepository: IEntityRepository<AnalysisBucket>;

    protected dispatcher: IBucketDispatcher;

    constructor(ctx: AnalysisStorageManagerContext) {
        this.repository = ctx.repository;
        this.bucketRepository = ctx.bucketRepository;
        this.dispatcher = ctx.dispatcher;
    }

    async check(
        input: string | Analysis,
        options: AnalysisStorageMangerCheckOptions = {},
    ): Promise<Analysis> {
        const entity = await this.resolve(input);

        const bucketTypes = options.type ?
            [options.type] :
            Object.values(AnalysisBucketType);

        for (const bucketType of bucketTypes) {
            const analysisBucket = await this.bucketRepository.findOneBy({
                analysisId: entity.id,
                type: bucketType,
            });

            if (analysisBucket) {
                continue;
            }

            await this.dispatcher.dispatchCreate({
                name: buildAnalysisBucketName(bucketType, entity.id),
                realmId: entity.realmId,
                refType: DomainType.ANALYSIS,
                refId: entity.id,
            });
        }

        return entity;
    }

    async remove(
        input: string | Analysis,
        options: AnalysisStorageMangerRemoveOptions = {},
    ): Promise<Analysis> {
        const entity = await this.resolve(input);

        const bucketTypes = options.type ?
            [options.type] :
            Object.values(AnalysisBucketType);

        for (const bucketType of bucketTypes) {
            const analysisBucket = await this.bucketRepository.findOneBy({
                analysisId: entity.id,
                type: bucketType,
            });

            if (!analysisBucket) {
                continue;
            }

            await this.dispatcher.dispatchDelete({ id: analysisBucket.bucketId });
        }

        return entity;
    }

    async clear(
        input: string | Analysis,
        options: AnalysisStorageMangerClearOptions = {},
    ): Promise<Analysis> {
        const entity = await this.resolve(input);

        const bucketTypes = options.type ?
            [options.type] :
            Object.values(AnalysisBucketType);

        for (const bucketType of bucketTypes) {
            const analysisBucket = await this.bucketRepository.findOneBy({
                analysisId: entity.id,
                type: bucketType,
            });

            if (!analysisBucket) {
                continue;
            }

            await this.dispatcher.dispatchClear({ id: analysisBucket.bucketId });
        }

        return entity;
    }

    protected async resolve(input: string | Analysis): Promise<Analysis> {
        if (typeof input === 'string') {
            const entity = await this.repository.findOneById(input);

            if (!entity) {
                throw new BadRequestError('Analysis could not be found.');
            }

            return entity;
        }

        return input;
    }
}
