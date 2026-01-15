/*
 * Copyright (c) 2021-2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type {
    EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import {
    DomainType,
} from '@privateaim/core-kit';
import { BaseSubscriber } from '@privateaim/server-db-kit';
import { EntityEventDestination } from '@privateaim/server-kit';
import { DomainEventNamespace } from '@privateaim/kit';
import {
    AnalysisMetadataCommand,
    useAnalysisMetadataComponentCaller,
} from '../../../components/index.ts';
import { AnalysisBucketFileEntity } from './entity.ts';

@EventSubscriber()
export class AnalysisBucketFileSubscriber extends BaseSubscriber<
AnalysisBucketFileEntity
> implements EntitySubscriberInterface<AnalysisBucketFileEntity> {
    constructor() {
        super({
            refType: DomainType.ANALYSIS_BUCKET_FILE,
            destinations: (data) => {
                const destinations: EntityEventDestination[] = [
                    {
                        namespace: DomainEventNamespace,
                        channel: DomainType.ANALYSIS_BUCKET_FILE,
                    },
                    {

                        namespace: DomainEventNamespace,
                        channel: [DomainType.ANALYSIS_BUCKET_FILE, data.id],
                    },
                ];

                if (data.realm_id) {
                    destinations.push({
                        namespace: [DomainEventNamespace, data.realm_id],
                        channel: DomainType.ANALYSIS_BUCKET_FILE,
                    });

                    destinations.push({
                        namespace: [DomainEventNamespace, data.realm_id],
                        channel: [DomainType.ANALYSIS_BUCKET_FILE, data.id],
                    });
                }

                return destinations;
            },
        });
    }

    async afterInsert(event: InsertEvent<AnalysisBucketFileEntity>): Promise<any> {
        await super.afterInsert(event);

        if (event.entity.root) {
            const caller = useAnalysisMetadataComponentCaller();
            Promise.resolve()
                .then(() => caller.call(
                    AnalysisMetadataCommand.RECALC,
                    {
                        analysisId: event.entity.analysis_id,
                        queryNodes: false,
                        querySelf: false,
                    },
                    {},
                ));
        }
    }

    async afterUpdate(event: UpdateEvent<AnalysisBucketFileEntity>): Promise<any> {
        await super.afterUpdate(event);

        const analysisId = event.entity?.analysis_id ??
            event.databaseEntity?.analysis_id;

        const caller = useAnalysisMetadataComponentCaller();
        Promise.resolve()
            .then(() => caller.call(
                AnalysisMetadataCommand.RECALC,
                {
                    analysisId,
                    queryNodes: false,
                    querySelf: false,
                },
                {},
            ));
    }

    async afterRemove(event: RemoveEvent<AnalysisBucketFileEntity>): Promise<any> {
        if (event.entity.root) {
            const caller = useAnalysisMetadataComponentCaller();
            Promise.resolve()
                .then(() => caller.call(
                    AnalysisMetadataCommand.RECALC,
                    {
                        analysisId: event.entity.analysis_id,
                        queryNodes: false,
                        querySelf: false,
                    },
                    {},
                ));
        }
    }

    listenTo() {
        return AnalysisBucketFileEntity;
    }
}
