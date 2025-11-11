/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Component, ComponentEventMap, ComponentHandlers,
} from './type';
import type {
    ComponentHandler, ComponentHandlerContext, ComponentHandlerFn,
} from './handler';

export abstract class BaseComponent<
    EventMap extends ComponentEventMap = ComponentEventMap,
> implements Component {
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
        const keys = Object.keys(this.handlers);
        for (let i = 0; i < keys.length; i++) {
            const handler = this.handlers[keys[i]];

            if (
                typeof handler !== 'function' &&
                handler.initialize
            ) {
                promises.push(handler.initialize());
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
     * @param value
     */
    async handle<Key extends keyof EventMap>(
        key: Key & string,
        ...value: EventMap[Key]
    ) : Promise<void> {
        await this.initialize();

        const handler = this.handlers.get(key) as ComponentHandler<EventMap, Key> |
        ComponentHandlerFn<EventMap, Key>;

        if (!handler) {
            if (key === '*') {
                throw new Error(`${key as string} key could not be handled.`);
            }

            return this.handle(
                '*' as Key & string,
                ...value as EventMap[Key],
            );
        }

        const [data, metadata] = value;

        const context : ComponentHandlerContext<EventMap, Key> = {
            key,
            metadata,
            handle: (
                childKey,
                childData,
                childMetadata,
            ) => {
                const childPayload = [
                    childData,
                    {
                        ...metadata,
                        ...(childMetadata || {}),
                    },
                ];

                this.handle(
                    childKey as Key & string,
                    ...childPayload as EventMap[Key],
                );
            },
        };

        if (typeof handler === 'function') {
            return handler(data, context);
        }

        return handler.handle(data, context);
    }

    abstract start() : Promise<void> | void;
}
