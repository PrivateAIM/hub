/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { NotFoundError } from '@ebec/http';
import {
    AnalysisConfiguratorCommandChecker, NodeType,
} from '@privateaim/core-kit';
import type { Repository } from 'typeorm';
import type { AnalysisMetadataComponentCaller } from '../../components';
import { useAnalysisMetadataComponentCaller } from '../../components';
import {
    AnalysisEntity, AnalysisNodeEntity, useDataSourceSync,
} from '../../database';
import { RequestRepositoryAdapter } from '../../http/request';
import type { AnalysisConfiguratorLockOptions, AnalysisConfiguratorUnlockOptions } from './types';

export class AnalysisConfigurator {
    protected repository : Repository<AnalysisEntity>;

    protected analysisNodeRepository: Repository<AnalysisNodeEntity>;

    protected metadataCaller : AnalysisMetadataComponentCaller;

    constructor() {
        const dataSource = useDataSourceSync();

        this.repository = dataSource.getRepository(AnalysisEntity);
        this.analysisNodeRepository = dataSource.getRepository(AnalysisNodeEntity);
        this.metadataCaller = useAnalysisMetadataComponentCaller();
    }

    // ---------------------------------------------------------------

    /**
     * Lock the analysis configuration.
     * The analysis and related resources become immutable and can not be changed.
     *
     * @param input
     * @param options
     */
    async lock(
        input: string | AnalysisEntity,
        options: AnalysisConfiguratorLockOptions = {},
    ): Promise<AnalysisEntity> {
        const entityId = typeof input === 'string' ? input : input.id;
        const entity = await this.metadataCaller.callRecalcDirect({
            analysisId: entityId,
        });

        AnalysisConfiguratorCommandChecker.canLock(entity);

        entity.configuration_locked = true;

        if (options.request) {
            const requestRepository = new RequestRepositoryAdapter(
                options.request,
                this.repository,
            );

            await requestRepository.save(entity);
        } else {
            await this.repository.save(entity);
        }

        return entity;
    }

    /**
     * Un the analysis configuration.
     * The analysis and related resources become mutable and can be changed again.
     *
     * @param input
     * @param options
     */
    async unlock(
        input: string | AnalysisEntity,
        options : AnalysisConfiguratorUnlockOptions = {},
    ): Promise<AnalysisEntity> {
        const entity = await this.resolve(input);

        AnalysisConfiguratorCommandChecker.canUnlock(entity);

        const analysisNodes = await this.analysisNodeRepository.find({
            where: {
                analysis_id: entity.id,
            },
            relations: ['node'],
        });

        for (let i = 0; i < analysisNodes.length; i++) {
            if (
                analysisNodes[i].node &&
                analysisNodes[i].node.type === NodeType.AGGREGATOR
            ) {
                continue;
            }

            if (!options.ignoreApproval) {
                analysisNodes[i].approval_status = null;
            }

            await this.analysisNodeRepository.save(analysisNodes[i]);
        }

        entity.configuration_locked = false;
        entity.build_status = null;

        if (options.request) {
            const requestRepository = new RequestRepositoryAdapter(
                options.request,
                this.repository,
            );

            await requestRepository.save(entity);
        } else {
            await this.repository.save(entity);
        }

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
