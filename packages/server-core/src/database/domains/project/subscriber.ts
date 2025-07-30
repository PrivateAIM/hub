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
import { ProjectEntity } from './entity';
import { BaseSubscriber } from '../../subscriber/base';

@EventSubscriber()
export class ProjectSubscriber extends BaseSubscriber<
ProjectEntity
> implements EntitySubscriberInterface<ProjectEntity> {
    constructor() {
        super(DomainType.PROJECT, [
            {
                channel: (id) => buildDomainChannelName(DomainType.PROJECT, id),
                namespace: (data) => buildDomainNamespaceName(data.realm_id),
            },
            {
                channel: (id) => buildDomainChannelName(DomainType.PROJECT, id),
                namespace: buildDomainNamespaceName(),
            },
        ]);
    }

    listenTo(): CallableFunction | string {
        return ProjectEntity;
    }
}
