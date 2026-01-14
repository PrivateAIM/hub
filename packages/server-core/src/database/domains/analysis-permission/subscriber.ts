/*
 * Copyright (c) 2021-2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type {
    EntitySubscriberInterface,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';
import {
    DomainType,
} from '@privateaim/core-kit';
import { BaseSubscriber } from '@privateaim/server-db-kit';
import { EntityEventDestination } from '@privateaim/server-kit';
import { DomainEventNamespace } from '@privateaim/kit';
import { AnalysisPermissionEntity } from './entity.ts';

@EventSubscriber()
export class AnalysisPermissionSubscriber extends BaseSubscriber<
AnalysisPermissionEntity
> implements EntitySubscriberInterface<AnalysisPermissionEntity> {
    constructor() {
        super({
            refType: DomainType.ANALYSIS_PERMISSION,
            destinations: (data) => {
                const destinations: EntityEventDestination[] = [
                    {
                        namespace: DomainEventNamespace,
                        channel: DomainType.ANALYSIS_PERMISSION,
                    },
                    {

                        namespace: DomainEventNamespace,
                        channel: [DomainType.ANALYSIS_PERMISSION, data.id],
                    },
                ];

                if (data.analysis_realm_id) {
                    destinations.push({
                        namespace: [DomainEventNamespace, data.analysis_realm_id],
                        channel: DomainType.ANALYSIS_PERMISSION,
                    });

                    destinations.push({
                        namespace: [DomainEventNamespace, data.analysis_realm_id],
                        channel: [DomainType.ANALYSIS_PERMISSION, data.id],
                    });
                }

                if (data.permission_realm_id) {
                    destinations.push({
                        namespace: [DomainEventNamespace, data.permission_realm_id],
                        channel: DomainType.ANALYSIS_PERMISSION,
                    });

                    destinations.push({
                        namespace: [DomainEventNamespace, data.permission_realm_id],
                        channel: [DomainType.ANALYSIS_PERMISSION, data.id],
                    });
                }

                return destinations;
            },
        });
    }

    listenTo() {
        return AnalysisPermissionEntity;
    }
}
