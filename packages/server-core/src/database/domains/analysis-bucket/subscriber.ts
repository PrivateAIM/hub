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
import { AnalysisBucketEntity } from './entity';
import { BaseSubscriber } from '../../subscriber/base';

@EventSubscriber()
export class AnalysisBucketSubscriber extends BaseSubscriber<AnalysisBucketEntity> implements EntitySubscriberInterface<AnalysisBucketEntity> {
    constructor() {
        super(DomainType.ANALYSIS_BUCKET, [
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_BUCKET, id),
                namespace: buildDomainNamespaceName(),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_BUCKET, id),
                namespace: (data) => buildDomainNamespaceName(data.realm_id),
            },
        ]);
    }

    listenTo() {
        return AnalysisBucketEntity;
    }
}
