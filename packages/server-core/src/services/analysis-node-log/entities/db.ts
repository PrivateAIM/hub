/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNodeLog } from '@privateaim/core-kit';
import { useDataSource } from 'typeorm-extension';
import type { SelectQueryBuilder } from 'typeorm';
import type { AnalysisNodeLogDeleteOptions, AnalysisNodeLogQueryOptions, AnalysisNodeLogStore } from '../types';
import { AnalysisNodeLogEntity } from '../../../database/domains';

export class AnalysisNodeLogDatabaseStore implements AnalysisNodeLogStore {
    async write(event: AnalysisNodeLog): Promise<AnalysisNodeLog> {
        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(AnalysisNodeLogEntity);

        const entity = repository.create(event as AnalysisNodeLogEntity);
        await repository.save(entity);

        return entity;
    }

    async delete(options: AnalysisNodeLogDeleteOptions): Promise<void> {
        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(AnalysisNodeLogEntity);

        const queryBuilder = repository.createQueryBuilder();

        this.applyBaseOptions(queryBuilder, options);

        await queryBuilder.delete().execute();
    }

    async query(options: AnalysisNodeLogQueryOptions): Promise<[AnalysisNodeLog[], number]> {
        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(AnalysisNodeLogEntity);
        const queryBuilder = repository.createQueryBuilder();

        this.applyBaseOptions(queryBuilder, options);

        if (options.sort) {
            queryBuilder.orderBy('log.created_at', options.sort);
        }

        if (options.limit) {
            queryBuilder.limit(options.limit);
        }

        return queryBuilder.getManyAndCount();
    }

    protected applyBaseOptions(
        queryBuilder: SelectQueryBuilder<AnalysisNodeLogEntity>,
        options: AnalysisNodeLogDeleteOptions,
    ) {
        if (options.analysis_id) {
            queryBuilder.andWhere('analysis_id = :analysisId', { analysisId: options.analysis_id });
        }

        if (options.node_id) {
            queryBuilder.andWhere('node_id = :nodeId', { nodeId: options.node_id });
        }

        if (options.start) {
            queryBuilder.andWhere('created_at >= :start', { start: options.start });
        }

        if (options.end) {
            queryBuilder.andWhere('created_at >= :end', { end: options.end });
        }
    }
}
