/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { QueueRouterHandler, QueueRouterHandlers } from '../queue-router';

export function buildComponentQueueRouterType(component: string, event: string) {
    return `${component}:::${event}`;
}

export function parseComponentQueueRouterType(type: string) : [string, string] {
    const [component, event] = type.split(':::');
    if (!component || !event) {
        throw new SyntaxError('The queue router type could not be parsed.');
    }

    return [component, event];
}

export function createComponentQueueRouterHandlers(handlers: QueueRouterHandlers) : QueueRouterHandlers {
    return {
        $any: async (message) => {
            const [, type] = parseComponentQueueRouterType(message.type);
            let handler : QueueRouterHandler | undefined;

            if (handlers[type]) {
                handler = handlers[type];
            } else {
                handler = handlers.$any;
            }

            if (typeof handler !== 'function') {
                return;
            }

            message.type = type;

            await handler(message);
        },
    };
}
