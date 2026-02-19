/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Factory } from 'singa';
import { singa } from 'singa';
import type { EntityEventPublisher } from './module';

const instance = singa<EntityEventPublisher>({
    name: 'entityEventPublisher',
});

export function setEntityEventPublisherFactory(factory: Factory<EntityEventPublisher>) {
    instance.setFactory(factory);
}

export function useEntityEventPublisher() {
    return instance.use();
}

export function isEntityEventPublisherUsable() {
    return instance.has() || instance.hasFactory();
}
