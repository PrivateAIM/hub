/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { HOUR_IN_MS, WEEK_IN_MS, createNanoID } from '@privateaim/kit';
import type { Cache } from '../cache';
import type {
    TaskEntry, TaskEntryResolved, TaskManagerCreateOptions, TaskTypeMap,
} from './types';
import { isTaskEntry } from './helpers';

export class TaskManager<
    EntityMap extends TaskTypeMap = TaskTypeMap,
> {
    protected driver : Cache;

    constructor(driver: Cache) {
        this.driver = driver;
    }

    /**
     * Store a specific job by type.
     *
     * @param type
     * @param data
     * @param options
     */
    async create<Key extends keyof EntityMap>(
        type: Key & string,
        data: EntityMap[Key],
        options: TaskManagerCreateOptions<EntityMap, Key> = {},
    ) : Promise<string> {
        let id : string;
        if (options.key) {
            id = `task:${options.key(type, data)}`;
        } else {
            id = `task:${createNanoID()}`;
        }

        if (options.lock) {
            const isLocked = await this.isLocked(id);
            if (isLocked) {
                return id;
            }
        }

        const entity : TaskEntry = {
            data,
            type,
        };

        await this.driver.set(id, entity, {
            ttl: WEEK_IN_MS,
        });

        if (options.lock) {
            await this.createLock(id);
        }

        return id;
    }

    /**
     * Get a job by id and type
     *
     * @param type
     * @param id
     * @param autoDelete
     */
    async get<Key extends keyof EntityMap>(
        type: Key & string,
        id: string,
        autoDelete: boolean = true,
    ) : Promise<EntityMap[Key]> {
        const entity = await this.resolve(id, autoDelete);
        if (!entity) {
            throw new Error(`Job with id ${id} could not be found.`);
        }

        if (type && entity.type !== type) {
            throw new Error(`Job type ${entity.type} does not not match with ${type}`);
        }

        return entity.data as EntityMap[Key];
    }

    /**
     * Find a random job.
     *
     * @param id
     * @param autoDelete
     */
    async resolve(
        id: string,
        autoDelete: boolean = true,
    ) : Promise<TaskEntryResolved<EntityMap> | undefined> {
        const entity : TaskEntry | undefined = await this.driver.get(id);
        if (!entity || !isTaskEntry(entity)) {
            return undefined;
        }

        await this.clearLock(id);

        if (autoDelete) {
            await this.driver.drop(id);
        }

        return entity as TaskEntryResolved<EntityMap>;
    }

    // -------------------------------------------------

    protected async createLock(id: string) {
        await this.driver.set(`taskLock:${id}`, true, {
            ttl: HOUR_IN_MS,
        });
    }

    protected async clearLock(id: string) {
        await this.driver.drop(`taskLock:${id}`);
    }

    protected async isLocked(id: string) : Promise<boolean> {
        const isActive = await this.driver.get(`taskLock:${id}`);

        return !!isActive;
    }
}
