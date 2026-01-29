/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Component, ComponentEventMap, ComponentHandleOptions, ComponentHandlers,
} from './type';
import type {
    ComponentHandler, ComponentHandlerContext, ComponentHandlerFn,
} from './handler';

export abstract class BaseComponent<
    EventMap extends ComponentEventMap = ComponentEventMap,
> implements Component<EventMap> {
    private initializePromise : Promise<void> | undefined;

    protected initialized : boolean;

    protected handlers: ComponentHandlers<EventMap>;

    protected constructor() {
        this.initializePromise = undefined;
        this.initialized = false;
        this.handlers = new Map();
    }

    mount<Key extends keyof EventMap>(
        key: Key,
        fn: ComponentHandler<EventMap, Key> | ComponentHandlerFn<EventMap, Key>
    ) : void;

    mount(
        key: '*',
        fn: ComponentHandler<EventMap> | ComponentHandlerFn<EventMap>
    ) : void;

    mount(
        key: PropertyKey,
        fn: ComponentHandler<EventMap> | ComponentHandlerFn<EventMap>,
    ) : void {
        this.handlers.set(key as keyof EventMap, fn);
    }

    unmount<Key extends keyof EventMap>(key: Key) {
        this.handlers.delete(key);
    }

    async initialize() : Promise<void> {
        if (this.initialized) {
            return Promise.resolve();
        }

        if (this.initializePromise) {
            return this.initializePromise;
        }

        const promises: Promise<void>[] = [];
        const keys = Array.from(this.handlers.keys());
        for (let i = 0; i < keys.length; i++) {
            const handler = this.handlers.get(keys[i]);

            if (
                typeof handler !== 'function' &&
                handler.initialize
            ) {
                promises.push(Promise.resolve().then(() => handler.initialize()));
            }
        }

        this.initializePromise = new Promise<void>((resolve, reject) => {
            Promise.all(promises)
                .then(() => resolve())
                .catch((err) => reject(err));
        });

        this.initializePromise.finally(() => {
            setTimeout(() => {
                this.initialized = true;
                this.initializePromise = undefined;
            }, 0);
        });

        return this.initializePromise;
    }

    /**
     * Handle specific component event.
     *
     * @param key
     * @param data
     * @param metadata
     * @param options
     */
    async handle<Key extends keyof EventMap>(
        key: Key & string,
        data: EventMap[Key][0],
        metadata: EventMap[Key][1] = {},
        options: ComponentHandleOptions<EventMap> = {},
    ) : Promise<void> {
        await this.initialize();

        const context : ComponentHandlerContext<EventMap, Key> = {
            key,
            metadata,
            handle: (
                childKey,
                childData,
                childMetadata,
            ) => {
                this.handle(
                    childKey as Key & string,
                    childData as EventMap[Key][0],
                    {
                        ...metadata,
                        ...(childMetadata || {}),
                    } as EventMap[Key][1],
                    {
                        ...options,
                        ...(options || {}),
                    },
                );
            },
        };

        let handler = this.handlers.get(key) as ComponentHandler<EventMap, Key> |
        ComponentHandlerFn<EventMap, Key>;

        if (handler) {
            if (typeof handler === 'function') {
                return handler(data, context);
            }

            return handler.handle(data, context);
        }

        handler = this.handlers.get('*') as ComponentHandler<EventMap, Key> |
        ComponentHandlerFn<EventMap, Key>;

        if (handler) {
            if (typeof handler === 'function') {
                return Promise.resolve()
                    .then(() => handler(data, context));
            }

            return Promise.resolve()
                .then(() => handler.handle(data, context));
        }

        if (options.handle) {
            return options.handle(data, context);
        }

        return Promise.resolve();
    }

    abstract start() : Promise<void> | void;
}
