/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TypedToken } from 'eldin';
import type { EntityEventPublisher } from './module';

export const ENTITY_EVENT_MODULE_NAME = 'entityEvent';

export const EntityEventPublisherInjectionKey = new TypedToken<EntityEventPublisher>('EntityEventPublisher');
