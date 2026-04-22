/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { LoggerModule } from '@privateaim/server-kit';
import type { IModule } from 'orkos';
import { ConfigModule } from '../../src/app/modules/config/index.ts';
import { VictoriaLogsModule } from '../../src/app/modules/victoria-logs/index.ts';
import { HTTPModule } from '../../src/app/modules/http/index.ts';

import { TestHTTPApplication } from './http.ts';
import { createTestDatabaseModule } from './database.ts';

export function createTestApplication(): TestHTTPApplication {
    process.env.PORT = '0';

    const modules: IModule[] = [
        new ConfigModule(),
        new LoggerModule(),
        new VictoriaLogsModule(),
        createTestDatabaseModule(),
        new HTTPModule(),
    ];

    return new TestHTTPApplication({ modules });
}
