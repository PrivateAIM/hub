/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client } from 'amqp-extension';
import { setAmqpFactory } from '../../core/amqp';
import { useEnv } from '../env';

export function configureAMQP() {
    setAmqpFactory(() => new Client({
        connection: useEnv('rabbitMqConnectionString'),
        exchange: {
            name: 'pht',
            type: 'topic',
        },
    }));
}
