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
import { AnalysisBucketFileEntity } from './entity';
import { BaseSubscriber } from '../../subscriber/base';

@EventSubscriber()
export class AnalysisBucketFileSubscriber extends BaseSubscriber<
AnalysisBucketFileEntity
> implements EntitySubscriberInterface<AnalysisBucketFileEntity> {
    constructor() {
        super(DomainType.ANALYSIS_BUCKET_FILE, [
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_BUCKET_FILE, id),
                namespace: buildDomainNamespaceName(),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_BUCKET_FILE, id),
                namespace: (data) => buildDomainNamespaceName(data.realm_id),
            },
        ]);
    }

    listenTo() {
        return AnalysisBucketFileEntity;
    }
}
