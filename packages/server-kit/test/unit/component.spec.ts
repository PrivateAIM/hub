/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { BaseComponent } from '../../src';
import type { ComponentHandleOptions } from '../../src';

type EventMap = {
    execute: [{ id: string }, Record<string, any>],
    executionFinished: [{ id: string }, Record<string, any>],
};

class TestComponent extends BaseComponent<EventMap> {
    constructor() {
        super();

        this.mount('execute', async (value, context) => {
            await context.handle('executionFinished', value);
        });
    }

    start() {}
}

describe('src/component', () => {
    it('should resolve a child handle only once the child event is handled', async () => {
        const order: string[] = [];
        const options: ComponentHandleOptions<EventMap> = {
            handle: async (_value, context) => {
                await new Promise((resolve) => {
                    setTimeout(resolve, 10);
                });
                order.push(context.key);
            },
        };

        await new TestComponent().handle('execute', { id: 'a' }, {}, options);
        order.push('done');

        expect(order).toEqual(['executionFinished', 'done']);
    });

    it('should propagate a failing child handle to the parent handler', async () => {
        const options: ComponentHandleOptions<EventMap> = {
            handle: () => {
                throw new Error('publish failed');
            },
        };

        await expect(new TestComponent().handle('execute', { id: 'a' }, {}, options))
            .rejects.toThrow('publish failed');
    });
});
