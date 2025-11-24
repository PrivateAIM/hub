/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, NotFoundError } from '@ebec/http';
import { AnalysisAPICommand, isAnalysisAPICommandExecutable } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import { AnalysisBuilderComponentCaller } from '@privateaim/server-core-worker-kit';
import type { Request } from 'routup';
import type { Repository } from 'typeorm';
import { AnalysisEntity, useDataSourceSync } from '../../database';
import { RequestRepositoryAdapter } from '../../http/request';
import type { AnalysisMetadataComponentCaller } from '../../components';
import {
    useAnalysisMetadataComponentCaller,
} from '../../components';

export class AnalysisBuilder {
    protected repository : Repository<AnalysisEntity>;

    protected caller : AnalysisBuilderComponentCaller;

    protected metadataCaller : AnalysisMetadataComponentCaller;

    constructor() {
        const dataSource = useDataSourceSync();
        this.repository = dataSource.getRepository(AnalysisEntity);
        this.caller = new AnalysisBuilderComponentCaller();
        this.metadataCaller = useAnalysisMetadataComponentCaller();
    }

    async start(
        input: string | AnalysisEntity,
        request?: Request,
    ) {
        const entityId = typeof input === 'string' ? input : input.id;
        const entity = await this.metadataCaller.callRecalcDirect({
            analysisId: entityId,
        });

        const check = isAnalysisAPICommandExecutable(entity, AnalysisAPICommand.BUILD_START);
        if (!check.success) {
            throw new BadRequestError(check.message);
        }

        entity.build_status = ProcessStatus.STARTING;

        if (request) {
            const requestRepository = new RequestRepositoryAdapter(
                request,
                this.repository,
            );

            await requestRepository.save(entity);
        } else {
            await this.repository.save(entity);
        }

        await this.caller.callExecute({
            id: entity.id,
        });

        return entity;
    }

    async check(input: string | AnalysisEntity) {
        const entity = await this.resolve(input);
        const check = isAnalysisAPICommandExecutable(entity, AnalysisAPICommand.BUILD_STATUS);
        if (!check.success) {
            throw new BadRequestError(check.message);
        }

        await this.caller.callCheck({
            id: entity.id,
        });

        return entity;
    }

    // ---------------------------------------------------------------

    protected async resolve(input: string | AnalysisEntity) : Promise<AnalysisEntity> {
        if (typeof input === 'string') {
            const entity = await this.repository.findOneBy({ id: input });
            if (!entity) {
                throw new NotFoundError('Analysis could not be found.');
            }

            return entity;
        }

        return input;
    }
}
