/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { 
    beforeEach, 
    describe, 
    expect, 
    it, 
} from 'vitest';
import { LogChannel, LogLevel } from '@privateaim/telemetry-kit';
import { MemoryLogStore } from '../../src/adapters/telemetry/memory.ts';

describe('MemoryLogStore', () => {
    let store: MemoryLogStore;

    beforeEach(() => {
        store = new MemoryLogStore();
    });

    describe('write', () => {
        it('should store a log entry', async () => {
            await store.write({
                message: 'test message',
                level: LogLevel.INFORMATIONAL,
                channel: LogChannel.SYSTEM,
                service: 'test-service',
                labels: { node_id: 'node-1' },
            });

            expect(store.items).toHaveLength(1);
            expect(store.items[0].message).toBe('test message');
        });

        it('should return the normalized log', async () => {
            const result = await store.write({
                message: 'hello',
                level: LogLevel.ERROR,
                channel: LogChannel.SYSTEM,
                service: 'svc',
                labels: {},
            });

            expect(result.message).toBe('hello');
            expect(result.level).toBe(LogLevel.ERROR);
        });
    });

    describe('query', () => {
        it('should return all items with no filter', async () => {
            await store.write({
                message: 'a', 
                level: LogLevel.INFORMATIONAL, 
                channel: LogChannel.SYSTEM, 
                service: 'svc', 
                labels: {}, 
            });
            await store.write({
                message: 'b', 
                level: LogLevel.ERROR, 
                channel: LogChannel.SYSTEM, 
                service: 'svc', 
                labels: {}, 
            });

            const [results, count] = await store.query();
            expect(results).toHaveLength(2);
            expect(count).toBe(2);
        });

        it('should filter by labels', async () => {
            await store.write({
                message: 'a', 
                level: LogLevel.INFORMATIONAL, 
                channel: LogChannel.SYSTEM, 
                service: 'svc', 
                labels: { node_id: 'node-1' }, 
            });
            await store.write({
                message: 'b', 
                level: LogLevel.INFORMATIONAL, 
                channel: LogChannel.SYSTEM, 
                service: 'svc', 
                labels: { node_id: 'node-2' }, 
            });

            const [results] = await store.query({ labels: { node_id: 'node-1' } });
            expect(results).toHaveLength(1);
            expect(results[0].message).toBe('a');
        });

        it('should return empty for non-matching labels', async () => {
            await store.write({
                message: 'a', 
                level: LogLevel.INFORMATIONAL, 
                channel: LogChannel.SYSTEM, 
                service: 'svc', 
                labels: { node_id: 'node-1' }, 
            });

            const [results] = await store.query({ labels: { node_id: 'nonexistent' } });
            expect(results).toHaveLength(0);
        });

        it('should exclude items without labels when filtering', async () => {
            await store.write({
                message: 'a', 
                level: LogLevel.INFORMATIONAL, 
                channel: LogChannel.SYSTEM, 
                service: 'svc', 
                labels: {}, 
            });

            const [results] = await store.query({ labels: { node_id: 'node-1' } });
            expect(results).toHaveLength(0);
        });
    });

    describe('delete', () => {
        it('should not throw', async () => {
            await expect(store.delete()).resolves.not.toThrow();
        });
    });
});
