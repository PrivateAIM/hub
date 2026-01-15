/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client } from 'amqp-extension';
import { setAmqpClientFactory } from '@privateaim/server-kit';
import { useEnv } from '../env/index.ts';

export function configureAmqp() {
    const connectionString = useEnv('rabbitMqConnectionString');
    if (connectionString) {
        setAmqpClientFactory(() => new Client({
            connectionOptions: connectionString,
        }));
    }
}
