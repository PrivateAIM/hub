/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client } from 'amqp-extension';
import { isBoolFalse, isBoolTrue } from '@privateaim/core';
import { setAmqpFactory } from '../../core';
import { ConfigDefaults, useEnv } from '../env';

export function configureAmqp() {
    const connectionString = useEnv('rabbitMqConnectionString');
    if (
        typeof connectionString !== 'undefined' &&
        !isBoolFalse(connectionString)
    ) {
        setAmqpFactory(() => new Client({
            connection: isBoolTrue(connectionString) ? ConfigDefaults.RABBITMQ : connectionString,
            exchange: {
                name: 'pht',
                type: 'topic',
            },
        }));
    }
}
