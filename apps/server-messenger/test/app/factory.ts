/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { LoggerModule } from '@privateaim/server-kit';
import type { IModule } from 'orkos';
import { ConfigModule } from '../../src/app/modules/config/index.ts';
import { WakeupModule } from '../../src/app/modules/wakeup/index.ts';
import { HTTPModule } from '../../src/app/modules/http/index.ts';
import { TestApplication } from './module.ts';
import { TestHTTPApplication } from './http.ts';
import { createTestDatabaseModule } from './database.ts';

export function createTestDatabaseApplication(): TestApplication {
    const modules: IModule[] = [
        createTestDatabaseModule(),
    ];

    return new TestApplication({ modules });
}

export function createTestApplication(): TestHTTPApplication {
    process.env.PORT = '0';
    process.env.REDIS_CONNECTION_STRING = process.env.REDIS_CONNECTION_STRING ?? 'redis://127.0.0.1';

    const modules: IModule[] = [
        new ConfigModule(),
        new LoggerModule(),
        createTestDatabaseModule(),
        new WakeupModule(),
        new HTTPModule(),
    ];

    return new TestHTTPApplication({ modules });
}
