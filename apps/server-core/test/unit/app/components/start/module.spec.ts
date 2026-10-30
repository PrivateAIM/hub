/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentStatus, IComponent } from 'hubwire';
import { describe, expect, it } from 'vitest';
import { startComponentsInBackground } from '../../../../../src/app/components/index.ts';
import { FakeLogger } from '../../aggregators/fake-logger.ts';

class FakeComponent implements IComponent {
    started = false;

    constructor(protected failure?: Error, protected hang = false) {}

    async start(): Promise<void> {
        if (this.hang) {
            await new Promise(() => {});
        }

        if (this.failure) {
            throw this.failure;
        }

        this.started = true;
    }

    async stop(): Promise<void> {
        this.started = false;
    }

    status(): ComponentStatus {
        return {};
    }
}

describe('startComponentsInBackground', () => {
    it('should log a component that fails to start and still start the others', async () => {
        const logger = new FakeLogger();
        const healthy = new FakeComponent();

        await startComponentsInBackground([
            new FakeComponent(new Error('PRECONDITION_FAILED - inequivalent arg for queue \'storageBucketEvents\'')),
            healthy,
        ], logger);

        expect(healthy.started).toBe(true);
        expect(logger.entries).toHaveLength(1);
        expect(logger.entries[0].level).toBe('error');
        expect(logger.entries[0].message).toContain('storageBucketEvents');
    });

    it('should log a failed start without waiting for a start that never settles', async () => {
        const logger = new FakeLogger();

        // not awaited: the hanging start keeps the helper pending forever
        void startComponentsInBackground([
            new FakeComponent(undefined, true),
            new FakeComponent(new Error('ACCESS_REFUSED')),
        ], logger);

        await new Promise((resolve) => {
            setImmediate(resolve);
        });

        expect(logger.entries).toHaveLength(1);
        expect(logger.entries[0].message).toContain('ACCESS_REFUSED');
    });

    it('should log nothing when every component starts', async () => {
        const logger = new FakeLogger();

        await startComponentsInBackground([new FakeComponent(), new FakeComponent()], logger);

        expect(logger.entries).toEqual([]);
    });
});
