/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { WEEK_IN_MS, createNanoID } from '@privateaim/kit';
import type { Cache } from '../cache';
import type { TaskEntry, TaskEntryResolved, TaskTypeMap } from './types';
import { isTaskEntry } from './helpers';

export class TaskManager<
    EntityMap extends TaskTypeMap = TaskTypeMap,
> {
    protected prefix : string;

    protected driver : Cache;

    constructor(driver: Cache) {
        this.driver = driver;
        this.prefix = 'task';
    }

    /**
     * Store a specific job by type.
     *
     * @param type
     * @param data
     */
    async create<Key extends keyof EntityMap>(
        type: Key & string,
        data: EntityMap[Key],
    ) : Promise<string> {
        const id = `${this.prefix}:${createNanoID()}`;

        const entity : TaskEntry = {
            data,
            type,
        };

        await this.driver.set(id, entity, {
            ttl: WEEK_IN_MS,
        });

        return id;
    }

    /**
     * Get a job by id and type
     *
     * @param type
     * @param id
     */
    async get<Key extends keyof EntityMap>(
        type: Key & string,
        id: string,
    ) : Promise<EntityMap[Key]> {
        const entity = await this.resolve(id);
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
     */
    async resolve(id: string) : Promise<TaskEntryResolved<EntityMap> | undefined> {
        const entity : TaskEntry | undefined = await this.driver.get(id);
        if (!entity || !isTaskEntry(entity)) {
            return undefined;
        }

        return entity as TaskEntryResolved<EntityMap>;
    }
}
