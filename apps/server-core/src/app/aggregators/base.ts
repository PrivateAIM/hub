/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    ComponentEventMap,
    ComponentHandler,
    ComponentHandlerContext,
    Logger,
    TaskEntryResolved,
    TaskManager,
} from '@privateaim/server-kit';
import type { DataSource } from 'typeorm';
import type { TaskMap } from '../../core/domains/index.ts';

export type BaseAggregatorHandlerContext = {
    dataSource: DataSource;
    taskManager: TaskManager<TaskMap>;
    logger?: Logger;
};

export abstract class BaseAggregatorHandler<
    EventMap extends ComponentEventMap = ComponentEventMap,
    Key extends keyof EventMap = keyof EventMap,
> implements ComponentHandler<EventMap> {
    protected dataSource: DataSource;

    protected taskManager: TaskManager<TaskMap>;

    protected logger?: Logger;

    constructor(ctx: BaseAggregatorHandlerContext) {
        this.dataSource = ctx.dataSource;
        this.taskManager = ctx.taskManager;
        this.logger = ctx.logger;
    }

    protected async resolveTask(context: ComponentHandlerContext<EventMap, Key>) : Promise<TaskEntryResolved<TaskMap>> {
        const { correlationId } = context.metadata;
        if (!correlationId) {
            this.logger?.info(`${context.key} metadata does not contain a correlationId.`);
            return null;
        }

        const task = await this.taskManager.resolve(correlationId);
        if (!task) {
            this.logger?.info(`${context.key} could not be associated to a triggered task.`);
            return null;
        }

        return task;
    }

    abstract handle(value: EventMap[Key][0], context: ComponentHandlerContext<EventMap, Key>) : Promise<void>;
}
