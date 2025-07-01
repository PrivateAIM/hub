/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { DataSourceOptions } from 'typeorm';
import { isRedisClientUsable } from '@privateaim/server-kit';
import {
    AnalysisBucketEntity,
    AnalysisBucketFileEntity,
    AnalysisEntity,
    AnalysisLogEntity,
    AnalysisNodeEntity,
    AnalysisNodeEventEntity,
    AnalysisNodeLogEntity,
    AnalysisPermissionEntity,
    MasterImageEntity,
    MasterImageEventLogEntity,
    MasterImageGroupEntity,
    NodeEntity,
    ProjectEntity,
    ProjectNodeEntity,
    RegistryEntity,
    RegistryProjectEntity,
} from '../../domains';
import { DatabaseQueryResultCache } from '../../cache';
import {
    AnalysisFileSubscriber,
    AnalysisLogSubscriber,
    AnalysisNodeEventSubscriber,
    AnalysisNodeLogSubscriber,
    AnalysisNodeSubscriber,
    AnalysisSubscriber,
    MasterImageEventLogSubscriber,
    MasterImageGroupSubscriber,
    MasterImageSubscriber,
    NodeSubscriber,
    ProjectNodeSubscriber,
    ProjectSubscriber,
    RegistryProjectSubscriber,
    RegistrySubscriber,
} from '../../subscribers';

export async function extendDataSourceOptions(options: DataSourceOptions) : Promise<DataSourceOptions> {
    options = {
        ...options,
        logging: false,
        entities: [
            ...(options.entities ? options.entities : []) as string[],
            MasterImageEntity,
            MasterImageEventLogEntity,
            MasterImageGroupEntity,
            ProjectEntity,
            ProjectNodeEntity,
            RegistryEntity,
            RegistryProjectEntity,
            NodeEntity,
            AnalysisEntity,
            AnalysisBucketEntity,
            AnalysisLogEntity,
            AnalysisBucketFileEntity,
            AnalysisNodeEntity,
            AnalysisNodeEventEntity,
            AnalysisNodeLogEntity,
            AnalysisPermissionEntity,
        ],
        migrations: [],
        migrationsTransactionMode: 'each',
        subscribers: [
            ...(options.subscribers ? options.subscribers : []) as string[],
            AnalysisSubscriber,
            AnalysisFileSubscriber,
            AnalysisLogSubscriber,
            AnalysisNodeSubscriber,
            AnalysisNodeEventSubscriber,
            AnalysisNodeLogSubscriber,
            MasterImageSubscriber,
            MasterImageEventLogSubscriber,
            MasterImageGroupSubscriber,
            NodeSubscriber,
            ProjectSubscriber,
            ProjectNodeSubscriber,
            AnalysisNodeLogSubscriber,
            RegistrySubscriber,
            RegistryProjectSubscriber,
        ],
    };

    const migrations : string[] = [];
    // const migration = await adjustFilePath(
    //     `src/database/migrations/${options.type}/*.{ts,js}`,
    // );

    // migrations.push(migration);

    Object.assign(options, {
        migrations,
    } as DataSourceOptions);

    if (isRedisClientUsable()) {
        Object.assign(options, {
            cache: {
                provider() {
                    return new DatabaseQueryResultCache();
                },
            },
        } as Partial<DataSourceOptions>);
    }

    if (options.type === 'mysql') {
        Object.assign(options, {
            connectorPackage: 'mysql2',
        } satisfies Partial<DataSourceOptions>);
    }

    return options;
}
