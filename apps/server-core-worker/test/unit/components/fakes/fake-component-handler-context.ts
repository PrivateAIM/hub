/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ComponentMetadata } from '@privateaim/server-kit';

export type FakeEmittedEvent = {
    event: string,
    payload: any,
    rest: any[]
};

/**
 * `ComponentHandlerContext` fake that records what a handler emitted. The
 * verdict of every distributor check IS an emitted event, so this is the
 * primary assertion surface for these specs.
 *
 * `key` is generic and required because the context type declares it as the
 * handled command's literal type — a widened `string` is not assignable, and
 * neither is an omitted one.
 */
export class FakeComponentHandlerContext<Key extends string = string> {
    public readonly emitted : FakeEmittedEvent[] = [];

    public readonly metadata : ComponentMetadata = {};

    constructor(public readonly key : Key) {}

    // The real `handle` is variadic — `(key, data, metadata?, options?)` — and a
    // two-parameter fake is not assignable to it. The trailing arguments are
    // recorded but nothing asserts on them yet.
    handle = async (event: string, payload: any, ...rest: any[]) : Promise<void> => {
        this.emitted.push({
            event,
            payload,
            rest,
        });
    };

    eventsOf(event: string) : FakeEmittedEvent[] {
        return this.emitted.filter((entry) => entry.event === event);
    }

    lastEvent() : FakeEmittedEvent | undefined {
        return this.emitted[this.emitted.length - 1];
    }
}
