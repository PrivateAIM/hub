/*
 * Copyright (c) 2021-2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type {
    EntitySubscriberInterface, InsertEvent, UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import {
    DomainType,
} from '@privateaim/core-kit';
import { BaseSubscriber } from '@privateaim/server-db-kit';
import { EntityEventDestination } from '@privateaim/server-kit';
import { DomainEventNamespace } from '@privateaim/kit';
import { AnalysisMetadataCommand, useAnalysisMetadataComponent } from '../../../components';
import { AnalysisEntity } from './entity';

@EventSubscriber()
export class AnalysisSubscriber extends BaseSubscriber<
AnalysisEntity
> implements EntitySubscriberInterface<AnalysisEntity> {
    constructor() {
        super({
            refType: DomainType.ANALYSIS,
            destinations: (data) => {
                const destinations: EntityEventDestination[] = [
                    {
                        namespace: DomainEventNamespace,
                        channel: DomainType.ANALYSIS,
                    },
                    {

                        namespace: DomainEventNamespace,
                        channel: [DomainType.ANALYSIS, data.id],
                    },
                ];

                if (data.realm_id) {
                    destinations.push({
                        namespace: [DomainEventNamespace, data.realm_id],
                        channel: DomainType.ANALYSIS,
                    });

                    destinations.push({
                        namespace: [DomainEventNamespace, data.realm_id],
                        channel: [DomainType.ANALYSIS, data.id],
                    });
                }

                return destinations;
            },
        });
    }

    async afterInsert(event: InsertEvent<AnalysisEntity>): Promise<any> {
        await super.afterInsert(event);

        if (event.entity.master_image_id) {
            const analysisConfiguration = useAnalysisMetadataComponent();
            analysisConfiguration.trigger(
                AnalysisMetadataCommand.RECALC,
                {
                    analysisId: event.entity.id,
                },
            );
        }
    }

    async afterUpdate(event: UpdateEvent<AnalysisEntity>): Promise<any> {
        await super.afterUpdate(event);

        const analysisConfiguration = useAnalysisMetadataComponent();
        analysisConfiguration.trigger(
            AnalysisMetadataCommand.RECALC,
            {
                analysisId: event.entity.analysis_id,
            },
        );
    }

    listenTo() {
        return AnalysisEntity;
    }
}
