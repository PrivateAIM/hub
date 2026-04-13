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
import { setMinioFactory } from '../../../core/index.ts';
import { MinioClientInjectionKey } from './constants.ts';
import type { MinioModuleOptions } from './types.ts';

export class MinioModule implements IModule {
    readonly name = 'minio';

    readonly dependencies: string[] = [];

    private options: MinioModuleOptions;

    constructor(options: MinioModuleOptions) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        const connectionConfig = parseProxyConnectionString(this.options.connectionString);

        const clientOptions: ClientOptions = {
            endPoint: connectionConfig.host,
            port: connectionConfig.port,
            useSSL: false,
            accessKey: connectionConfig.auth.username,
            secretKey: connectionConfig.auth.password,
        };

        const client = new Client(clientOptions);
        container.register(MinioClientInjectionKey, { useValue: client });

        // Bridge: back-fill singa singleton
        setMinioFactory(() => client);
    }
}
