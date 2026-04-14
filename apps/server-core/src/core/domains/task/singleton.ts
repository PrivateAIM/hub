/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Cache, TaskManager, createCacheAdapter } from '@privateaim/server-kit';
import { singa } from 'singa';
import type { TaskMap } from './types.ts';

const instance = singa<TaskManager<TaskMap>>({
    name: 'taskManager',
    factory: () => {
        const cacheAdapter = createCacheAdapter();
        const cache = new Cache(cacheAdapter);

        return new TaskManager<TaskMap>(cache);
    },
});

export function useTaskManager() : TaskManager<TaskMap> {
    return instance.use();
}
