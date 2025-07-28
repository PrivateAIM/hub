/*
 * Copyright (c) 2021-2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type {
    EntitySubscriberInterface,
} from 'typeorm';
import {
    EventSubscriber,
} from 'typeorm';
import {
    DomainSubType,
    DomainType,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@privateaim/core-kit';
import { ProjectNodeEntity } from './entity';
import { BaseSubscriber } from '../../subscriber/base';

@EventSubscriber()
export class ProjectNodeSubscriber extends BaseSubscriber<
ProjectNodeEntity
> implements EntitySubscriberInterface<ProjectNodeEntity> {
    constructor() {
        super(DomainType.PROJECT_NODE, [
            {
                channel: (id) => buildDomainChannelName(DomainSubType.PROJECT_NODE_IN, id),
                namespace: (data) => buildDomainNamespaceName(data.node_realm_id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainSubType.PROJECT_NODE_OUT, id),
                namespace: (data) => buildDomainNamespaceName(data.project_realm_id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.PROJECT_NODE, id),
                namespace: buildDomainNamespaceName(),
            },
            {
                channel: (id) => buildDomainChannelName(DomainSubType.PROJECT_NODE_IN, id),
                namespace: buildDomainNamespaceName(),
            },
            {
                channel: (id) => buildDomainChannelName(DomainSubType.PROJECT_NODE_OUT, id),
                namespace: buildDomainNamespaceName(),
            },
        ]);
    }

    listenTo(): CallableFunction | string {
        return ProjectNodeEntity;
    }
}
