/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImageGroup } from '@privateaim/core-kit';
import type { IEntityRepository, Logger } from '@privateaim/server-kit';
import type { IEventPublisher } from '@privateaim/server-telemetry-kit';
import type { IMasterImageRepository } from '../../../../core/entities/master-image/types.ts';

export type MasterImageSynchronizerAggregatorContext = {
    imageRepository: IMasterImageRepository;
    groupRepository: IEntityRepository<MasterImageGroup>;
    eventComponentDispatcher?: IEventPublisher;
    logger?: Logger;
};
