/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client } from 'amqp-extension';
import type { Factory } from 'singa';
import { singa } from 'singa';

const instance = singa<Client>({
    name: 'amqp',
});

export function setAmqpClientFactory(factory: Factory<Client>) {
    instance.setFactory(factory);
}

export function isAmqpClientUsable() {
    return instance.has() || instance.hasFactory();
}

export function useAmqpClient() {
    return instance.use();
}
