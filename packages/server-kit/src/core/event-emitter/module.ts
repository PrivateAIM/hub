/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { EventType, GenericEventHandler, GenericEventMap } from '@posva/event-emitter';
import { EventEmitter as BaseEventEmitter } from '@posva/event-emitter';
import type { Handler, RemoveEventListener, WildcardHandler } from './types';

export class EventEmitter<
    EventMap extends GenericEventMap = GenericEventMap,
> extends BaseEventEmitter<EventMap> {
    once<Key extends keyof EventMap>(
        type: Key,
        handler: Handler<EventMap[Key]>,
    ): RemoveEventListener;

    /**
     * Register an event handler for all events.
     * @param type `'*'`
     * @param handler Function to call in response to given event
     */
    once(type: '*', handler: WildcardHandler<EventMap>): RemoveEventListener;

    once(
        type: EventType,
        handler: GenericEventHandler<EventMap>,
    ): RemoveEventListener {
        let unregister : (() => void) | undefined;
        let handlerWrapper : GenericEventHandler<EventMap> = (...args: any) => {
            if (typeof unregister === 'function') {
                unregister();
            }

            unregister = undefined;
            handlerWrapper = undefined;
            return handler(...args);
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        unregister = this.on(type, handlerWrapper);

        return unregister;
    }
}
