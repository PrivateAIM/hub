/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    CoreBucketEventPayload,
} from '@privateaim/server-core-worker-kit';
import {
    AnalysisCoreEvent,
} from '@privateaim/server-core-worker-kit';
import {
    BaseComponent,
} from '@privateaim/server-kit';
import { AnalysisBucketEntity, AnalysisEntity, useDataSourceSync } from '../../../database';

class FakeComponent extends BaseComponent {
    // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-useless-constructor
    constructor() {
        super();
    }

    start(): Promise<void> | void {
        throw new Error('Not implemented.');
    }
}

export function defineAnalysisCoreHandlers() {
    const manager = new FakeComponent();

    manager.mount(AnalysisCoreEvent.BUCKET_CREATED, async (
        value: CoreBucketEventPayload,
    ) : Promise<void> => {
        const dataSource = useDataSourceSync();
        const repository = dataSource.getRepository(AnalysisEntity);
        const entity = await repository.findOneBy({
            id: value.id,
        });

        if (!entity) {
            return;
        }

        const bucketRepository = dataSource.getRepository(AnalysisBucketEntity);
        let bucket = await bucketRepository.findOneBy({
            analysis_id: value.id,
            type: value.bucketType,
        });

        if (bucket) {
            bucket = bucketRepository.merge(bucket, {
                external_id: value.bucketId,
            });
        } else {
            bucket = bucketRepository.create({
                analysis_id: value.id,
                type: value.bucketType,
                external_id: value.bucketId,
                realm_id: entity.realm_id,
            });
        }

        await bucketRepository.save(bucket);
    });

    manager.mount(AnalysisCoreEvent.BUCKET_DELETED, async (
        value: CoreBucketEventPayload,
    ) : Promise<void> => {
        const dataSource = useDataSourceSync();
        const repository = dataSource.getRepository(AnalysisEntity);
        const entity = await repository.findOneBy({
            id: value.id,
        });

        if (!entity) {
            return;
        }

        const bucketRepository = dataSource.getRepository(AnalysisBucketEntity);
        const bucket = await bucketRepository.findOneBy({
            type: value.bucketType,
            analysis_id: entity.id,
            // todo: maybe by external_id too
        });

        if (bucket) {
            await bucketRepository.remove(bucket);
        }
    });

    return manager;
}
