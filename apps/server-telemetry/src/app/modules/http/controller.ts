/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import { EventController } from '../../../adapters/http/controllers/event/module.ts';
import { LogController } from '../../../adapters/http/controllers/log/module.ts';
import { RootController } from '../../../adapters/http/controllers/root/index.ts';
import type { LogStore } from '../../../core/services/log-store/types.ts';
import { DatabaseInjectionKey } from '../database/constants.ts';
import { LogStoreInjectionKey } from '../victoria-logs/constants.ts';

export function createControllers(container: IContainer): Record<string, any>[] {
    const dataSource = container.resolve(DatabaseInjectionKey.DataSource);

    const logStoreResult = container.tryResolve(LogStoreInjectionKey);
    let logStore: LogStore | undefined;
    if (logStoreResult.success) {
        logStore = logStoreResult.data;
    }

    const controllers: Record<string, any>[] = [
        new EventController({ dataSource }),
        new RootController(),
    ];

    if (logStore) {
        controllers.push(new LogController({ logStore }));
    }

    return controllers;
}
