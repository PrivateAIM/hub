/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AmqpClient, setAmqpClientFactory } from '@privateaim/server-kit';
import { useEnv } from '../env/index.ts';

export function configureAMQP() {
    const rabbitMqConnectionString = useEnv('rabbitMqConnectionString');
    if (!rabbitMqConnectionString) {
        return;
    }

    setAmqpClientFactory(() => new AmqpClient({
        connectionOptions: rabbitMqConnectionString,
    }));
}
