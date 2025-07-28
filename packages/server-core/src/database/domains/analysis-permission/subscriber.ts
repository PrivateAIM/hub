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
import { AnalysisPermissionEntity } from './entity';
import { BaseSubscriber } from '../../subscriber/base';

@EventSubscriber()
export class AnalysisPermissionSubscriber extends BaseSubscriber<
AnalysisPermissionEntity
> implements EntitySubscriberInterface<AnalysisPermissionEntity> {
    constructor() {
        super(DomainType.ANALYSIS_PERMISSION, [
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_PERMISSION, id),
                namespace: buildDomainNamespaceName(),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_PERMISSION, id),
                namespace: (data) => buildDomainNamespaceName(data.permission_realm_id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.ANALYSIS_PERMISSION, id),
                namespace: (data) => buildDomainNamespaceName(data.analysis_realm_id),
            },
        ]);
    }

    listenTo() {
        return AnalysisPermissionEntity;
    }
}
