/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, NotFoundError } from '@ebec/http';
import { AnalysisAPICommand, isAnalysisAPICommandExecutable } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import type { AnalysisBuilderComponentCaller } from '@privateaim/server-core-worker-kit';
import type { Request } from 'routup';
import type { Repository } from 'typeorm';
import { AnalysisEntity, RegistryEntity, useDataSourceSync } from '../../database';
import { RequestRepositoryAdapter } from '../../http/request';

export class AnalysisBuilder {
    protected repository : Repository<AnalysisEntity>;

    protected registryRepository: Repository<RegistryEntity>;

    protected caller : AnalysisBuilderComponentCaller;

    constructor() {
        const dataSource = useDataSourceSync();
        this.repository = dataSource.getRepository(AnalysisEntity);
        this.registryRepository = dataSource.getRepository(RegistryEntity);
    }

    async start(
        input: string | AnalysisEntity,
        request?: Request,
    ) {
        const entity = await this.resolve(input);

        // todo: call analysis-metadata component

        const check = isAnalysisAPICommandExecutable(entity, AnalysisAPICommand.BUILD_START);
        if (!check.success) {
            throw new BadRequestError(check.message);
        }

        if (!entity.registry_id) {
            const [registry] = await this.registryRepository.find({
                take: 1,
            });

            if (!registry) {
                throw new BadRequestError('No registry is registered.');
            }

            entity.registry_id = registry.id;
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

    async stop(
        input: string | AnalysisEntity,
        request?: Request,
    ) {
        const entity = await this.resolve(input);

        const check = isAnalysisAPICommandExecutable(entity, AnalysisAPICommand.BUILD_STOP);
        if (!check.success) {
            throw new BadRequestError(check.message);
        }

        entity.build_status = entity.build_status !== ProcessStatus.STOPPING ?
            ProcessStatus.STOPPING :
            ProcessStatus.STOPPED;

        if (request) {
            const requestRepository = new RequestRepositoryAdapter(
                request,
                this.repository,
            );

            await requestRepository.save(entity);
        } else {
            await this.repository.save(entity);
        }

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
