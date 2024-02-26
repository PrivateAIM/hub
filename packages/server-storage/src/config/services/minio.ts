/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { parseProxyConnectionString } from '@privateaim/core';
import type { ClientOptions } from 'minio';
import { Client } from 'minio';
import { setMinioFactory } from '../../core';
import { useEnv } from '../env';

export function setupMinio() {
    const connectionString = useEnv('minioConnectionString');
    const connectionConfig = parseProxyConnectionString(connectionString);

    setMinioFactory(() => {
        const options : ClientOptions = {
            endPoint: connectionConfig.host,
            port: connectionConfig.port,
            useSSL: false,
            accessKey: connectionConfig.auth.username,
            secretKey: connectionConfig.auth.password,
        };

        return new Client(options);
    });
}
