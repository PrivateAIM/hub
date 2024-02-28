/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { createConnection } from 'amqp-extension';
import type { Factory } from 'singa';
import { singa } from 'singa';

type Connection = ReturnType<typeof createConnection>;

const instance = singa<Connection>({
    name: 'amqp',
});
export function setAmqpFactory(factory: Factory<Connection>) {
    instance.setFactory(factory);
}

export function hasAmqpClient() {
    return instance.has() || instance.hasFactory();
}

export function useAmqpClient() {
    instance.use();
}
