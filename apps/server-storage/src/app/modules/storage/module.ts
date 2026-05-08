/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { Client } from 'minio';
import path from 'node:path';
import process from 'node:process';
import { parseProxyConnectionString } from '@privateaim/kit';
import type { StorageAdapter } from '../../../core/storage/types.ts';
import { MinioStorageAdapter } from '../../../adapters/storage/minio.ts';
import { FsStorageAdapter } from '../../../adapters/storage/fs.ts';
import { ConfigInjectionKey } from '../config/constants.ts';
import { StorageInjectionKey } from './constants.ts';

export class StorageModule implements IModule {
    readonly name = 'storage';

    readonly dependencies: string[] = ['config'];

    async setup(container: IContainer): Promise<void> {
        const config = container.resolve(ConfigInjectionKey);

        let adapter: StorageAdapter;

        if (config.minioConnectionString) {
            const connectionConfig = parseProxyConnectionString(config.minioConnectionString);

            const client = new Client({
                endPoint: connectionConfig.host,
                port: connectionConfig.port,
                useSSL: false,
                accessKey: connectionConfig.auth.username,
                secretKey: connectionConfig.auth.password,
            });

            adapter = new MinioStorageAdapter(client);
        } else {
            const basePath = config.storagePath ||
                path.join(process.cwd(), 'writable', 'storage');
            adapter = new FsStorageAdapter(basePath);
        }

        container.register(StorageInjectionKey, { useValue: adapter });
    }
}
