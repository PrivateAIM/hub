/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { wait } from '@privateaim/kit';
import { LogChannel, LogLevel } from '@privateaim/telemetry-kit';
import { MemoryLogStore } from '../../src';

describe('logger', () => {
    it('should work with store', async () => {
        const store = new MemoryLogStore();

        await store.write({
            channel: LogChannel.SYSTEM,
            level: LogLevel.ERROR,
            service: 'unknown',
            message: 'foo',
            labels: {
                foo: 'bar',
            },
        });

        await wait(0);

        expect(store.items).toHaveLength(1);

        const [item] = store.items;

        expect(item.channel).toBe(LogChannel.SYSTEM);
        expect(item.level).toEqual(LogLevel.ERROR);
        expect(item.service).toEqual('unknown');
        expect(item.message).toEqual('foo');
        expect(item.labels).toEqual({
            foo: 'bar',
        });
        expect(item.time).toBeDefined();
    });
});
