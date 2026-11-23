/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { LoggerTransport } from '../../../src';

describe('LoggerTransport', () => {
    it('reports a rejected save as a warning instead of an unhandled rejection', async () => {
        const transport = new LoggerTransport({ save: () => Promise.reject(new Error('sink down')) });

        const warned = new Promise<unknown>((resolve) => {
            transport.on('warn', resolve);
        });
        const nextCalled = new Promise<void>((resolve) => {
            transport.log({ message: 'hello', level: 'info' }, () => resolve());
        });

        await nextCalled;

        const warning = await warned;

        expect(warning).toBeInstanceOf(Error);
        expect(warning).toHaveProperty('message', 'sink down');
    });

    it('lifts flag labels to fields and passes the entry to save', async () => {
        const saved: unknown[] = [];
        const transport = new LoggerTransport({
            labels: { service: 'test', node: 'a' },
            save: (value) => {
                saved.push(value);
            },
        });

        await new Promise<void>((resolve) => {
            transport.log({ message: 'hello', level: 'info' }, () => resolve());
        });

        expect(saved).toHaveLength(1);
        expect(saved[0]).toMatchObject({
            message: 'hello',
            service: 'test',
            level: 'info',
            labels: { node: 'a' },
        });
    });
});
