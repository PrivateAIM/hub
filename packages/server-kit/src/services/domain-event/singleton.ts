/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Factory } from 'singa';
import { singa } from 'singa';
import type { DomainEventPublisher } from './module';

const instance = singa<DomainEventPublisher>({
    name: 'domainEventPublisher',
});

export function setDomainEventPublisherFactory(factory: Factory<DomainEventPublisher>) {
    instance.setFactory(factory);
}

export function useDomainEventPublisher() {
    return instance.use();
}
