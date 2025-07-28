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
import { AnalysisEntity } from './entity';
import { BaseSubscriber } from '../../subscriber/base';

@EventSubscriber()
export class AnalysisSubscriber extends BaseSubscriber<AnalysisEntity> implements EntitySubscriberInterface<AnalysisEntity> {
    constructor() {
        super(DomainType.ANALYSIS, [
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS, id),
                namespace: buildDomainNamespaceName(),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS, id),
                namespace: (data) => buildDomainNamespaceName(data.realm_id),
            },
        ]);
    }

    listenTo() {
        return AnalysisEntity;
    }
}
