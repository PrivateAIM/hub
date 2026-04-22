/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import type { ClientOptions } from 'minio';
import { Client } from 'minio';
import { parseProxyConnectionString } from '@privateaim/kit';
import { ConfigInjectionKey } from '../config/constants.ts';
import type { Config } from '../config/types.ts';
import { MinioClientInjectionKey } from './constants.ts';

export class MinioModule implements IModule {
    readonly name = 'minio';

    readonly dependencies: string[] = ['config'];

    async setup(container: IContainer): Promise<void> {
        const config = container.resolve(ConfigInjectionKey) as Config;

        const connectionConfig = parseProxyConnectionString(config.minioConnectionString);

        const clientOptions: ClientOptions = {
            endPoint: connectionConfig.host,
            port: connectionConfig.port,
            useSSL: false,
            accessKey: connectionConfig.auth.username,
            secretKey: connectionConfig.auth.password,
        };

        const client = new Client(clientOptions);
        container.register(MinioClientInjectionKey, { useValue: client });
    }
}
