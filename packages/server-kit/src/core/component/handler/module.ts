/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '../../../type';
import { isComponentHandlerFn } from './check';
import type { ComponentHandler, ComponentHandlerFn } from './types';

export class ComponentHandlers {
    protected initializing : boolean;

    protected initialized : boolean;

    protected handlers: Record<string, ComponentHandlerFn | ComponentHandler>;

    constructor() {
        this.initializing = false;
        this.initialized = false;
        this.handlers = {};
    }

    mount<K extends string>(key: K, fn: ComponentHandler<K, any> | ComponentHandlerFn<K, any>) {
        this.handlers[key] = fn;
    }

    unmount(key: string) {
        delete this.handlers[key];
    }

    async initialize() : Promise<void> {
        if (this.initializing || this.initialized) {
            return;
        }

        this.initializing = true;

        const keys = Object.keys(this.handlers);
        for (let i = 0; i < keys.length; i++) {
            const handler = this.handlers[keys[i]];

            if (
                !isComponentHandlerFn(handler) &&
                handler.setup
            ) {
                await handler.setup();
            }
        }

        this.initialized = true;
        this.initializing = false;
    }

    async execute(
        key: string,
        value: ObjectLiteral = {},
        metadata: ObjectLiteral = {},
    ) : Promise<void> {
        await this.initialize();

        const handler = this.handlers[key];
        if (!handler) {
            return;
        }

        if (isComponentHandlerFn(handler)) {
            await handler(value, { key, metadata });
        } else {
            await handler.handle(value, { key, metadata });
        }
    }
}
