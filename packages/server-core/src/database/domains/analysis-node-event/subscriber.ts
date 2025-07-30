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
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@privateaim/core-kit';
import { AnalysisNodeEventEntity } from './entity';
import { BaseSubscriber } from '../../subscriber/base';

@EventSubscriber()
export class AnalysisNodeEventSubscriber extends BaseSubscriber<
AnalysisNodeEventEntity
> implements EntitySubscriberInterface<AnalysisNodeEventEntity> {
    constructor() {
        super(DomainType.ANALYSIS_NODE_EVENT, [
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_NODE_EVENT, id),
                namespace: buildDomainNamespaceName(),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_NODE_EVENT, id),
                namespace: (data) => buildDomainNamespaceName(data.analysis_realm_id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_NODE_EVENT, id),
                namespace: (data) => buildDomainNamespaceName(data.node_realm_id),
            },
        ]);
    }

    listenTo(): CallableFunction | string {
        return AnalysisNodeEventEntity;
    }
}
