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
    TaskEntryResolved,
} from '@privateaim/server-kit';
import { useLogger } from '@privateaim/server-kit';
import type { TaskMap } from '../domains/index.ts';
import { useTaskManager } from '../domains/index.ts';

export abstract class BaseAggregatorHandler<
    EventMap extends ComponentEventMap = ComponentEventMap,
    Key extends keyof EventMap = keyof EventMap,
> implements ComponentHandler<EventMap> {
    protected async resolveTask(context: ComponentHandlerContext<EventMap, Key>) : Promise<TaskEntryResolved<TaskMap>> {
        const { correlationId } = context.metadata;
        if (!correlationId) {
            useLogger().info(`${context.key} metadata does not contain a correlationId.`);
            return null;
        }

        const taskManager = useTaskManager();
        const task = await taskManager.resolve(correlationId);
        if (!task) {
            useLogger().info(`${context.key} could not be associated to a triggered task.`);
            return null;
        }

        return task;
    }

    abstract handle(value: EventMap[Key][0], context: ComponentHandlerContext<EventMap, Key>) : Promise<void>;
}
