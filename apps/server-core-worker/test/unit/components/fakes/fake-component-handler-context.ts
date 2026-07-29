/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

export type FakeEmittedEvent = {
    event: string,
    payload: any
};

/**
 * `ComponentHandlerContext` fake that records what a handler emitted. The
 * verdict of every distributor check IS an emitted event, so this is the
 * primary assertion surface for these specs.
 */
export class FakeComponentHandlerContext {
    public readonly emitted : FakeEmittedEvent[] = [];

    handle = async (event: string, payload: any) : Promise<void> => {
        this.emitted.push({ event, payload });
    };

    eventsOf(event: string) : FakeEmittedEvent[] {
        return this.emitted.filter((entry) => entry.event === event);
    }

    lastEvent() : FakeEmittedEvent | undefined {
        return this.emitted[this.emitted.length - 1];
    }
}
