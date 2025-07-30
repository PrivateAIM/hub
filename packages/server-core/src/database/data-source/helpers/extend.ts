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
    AnalysisBucketFileSubscriber,
    AnalysisBucketSubscriber,
    AnalysisEntity, AnalysisNodeEntity,
    AnalysisNodeEventEntity,
    AnalysisNodeEventSubscriber,
    AnalysisNodeSubscriber,
    AnalysisPermissionEntity,
    AnalysisPermissionSubscriber,
    AnalysisSubscriber,
    EventEntity,
    EventSubscriber,
    MasterImageEntity,
    MasterImageGroupEntity,
    MasterImageGroupSubscriber,
    MasterImageSubscriber,
    NodeEntity,
    NodeSubscriber,
    ProjectEntity,
    ProjectNodeEntity,
    ProjectNodeSubscriber,
    ProjectSubscriber,
    RegistryEntity,
    RegistryProjectEntity,
    RegistryProjectSubscriber,
    RegistrySubscriber,
} from '../../domains';
import { DatabaseQueryResultCache } from '../../cache';

export async function extendDataSourceOptions(options: DataSourceOptions) : Promise<DataSourceOptions> {
    options = {
        ...options,
        logging: false,
        entities: [
            ...(options.entities ? options.entities : []) as string[],
            EventEntity,
            MasterImageEntity,
            MasterImageGroupEntity,
            ProjectEntity,
            ProjectNodeEntity,
            RegistryEntity,
            RegistryProjectEntity,
            NodeEntity,
            AnalysisEntity,
            AnalysisBucketEntity,
            AnalysisBucketFileEntity,
            AnalysisNodeEntity,
            AnalysisNodeEventEntity,
            AnalysisPermissionEntity,
        ],
        migrations: [],
        migrationsTransactionMode: 'each',
        subscribers: [
            ...(options.subscribers ? options.subscribers : []) as string[],
            AnalysisSubscriber,
            AnalysisBucketSubscriber,
            AnalysisBucketFileSubscriber,
            AnalysisNodeSubscriber,
            AnalysisNodeEventSubscriber,
            AnalysisPermissionSubscriber,
            MasterImageSubscriber,
            EventSubscriber,
            MasterImageGroupSubscriber,
            NodeSubscriber,
            ProjectSubscriber,
            ProjectNodeSubscriber,
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
