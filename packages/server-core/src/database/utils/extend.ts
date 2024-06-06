/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { adjustFilePath } from 'typeorm-extension';
import type { DataSourceOptions } from 'typeorm';
import { isRedisClientUsable } from '@privateaim/server-kit';
import {
    AnalysisBucketEntity,
    AnalysisEntity,
    AnalysisBucketFileEntity,
    AnalysisLogEntity,
    AnalysisNodeEntity,
    MasterImageEntity,
    MasterImageGroupEntity,
    NodeEntity,
    ProjectEntity,
    ProjectNodeEntity,
    RegistryEntity,
    RegistryProjectEntity,
} from '../../domains';
import { DatabaseQueryResultCache } from '../cache';
import { MasterImageSubscriber } from '../subscribers/master-image';
import { MasterImageGroupSubscriber } from '../subscribers/master-image-group';
import { ProjectSubscriber } from '../subscribers/project';
import { ProjectNodeSubscriber } from '../subscribers/project-node';
import { RegistrySubscriber } from '../subscribers/registry';
import { RegistryProjectSubscriber } from '../subscribers/registry-project';
import { NodeSubscriber } from '../subscribers/node';
import { AnalysisSubscriber } from '../subscribers/analysis';
import { AnalysisFileSubscriber } from '../subscribers/analysis-file';
import { AnalysisLogSubscriber } from '../subscribers/analysis-log';
import { AnalysisNodeSubscriber } from '../subscribers/analysis-node';

export async function extendDataSourceOptions(options: DataSourceOptions) : Promise<DataSourceOptions> {
    options = {
        ...options,
        logging: false,
        entities: [
            ...(options.entities ? options.entities : []) as string[],
            MasterImageEntity,
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
        ],
        migrations: [],
        migrationsTransactionMode: 'each',
        subscribers: [
            ...(options.subscribers ? options.subscribers : []) as string[],
            AnalysisSubscriber,
            AnalysisFileSubscriber,
            AnalysisLogSubscriber,
            AnalysisNodeSubscriber,
            MasterImageSubscriber,
            MasterImageGroupSubscriber,
            ProjectSubscriber,
            ProjectNodeSubscriber,
            RegistrySubscriber,
            RegistryProjectSubscriber,
            NodeSubscriber,
        ],
    };

    const migrations : string[] = [];
    const migration = await adjustFilePath(
        `src/database/migrations/${options.type}/*.{ts,js}`,
    );

    migrations.push(migration);

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
