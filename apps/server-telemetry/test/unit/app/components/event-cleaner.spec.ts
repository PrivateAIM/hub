/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { EventComponentCleanerHandler } from '../../../../src/app/components/event/handlers/cleaner/module.ts';
import { FakeEventRepository } from '../../core/entities/event/fake-repository.ts';

describe('app/components/event/handlers/cleaner', () => {
    let repository: FakeEventRepository;
    let handler: EventComponentCleanerHandler;

    beforeEach(() => {
        repository = new FakeEventRepository();
        repository.rows = [
            {
                id: randomUUID(),
                expiring: true,
                expiresAt: new Date(Date.now() - 60_000).toISOString(),
            },
            {
                id: randomUUID(),
                expiring: true,
                expiresAt: new Date(Date.now() + 600_000).toISOString(),
            },
            {
                id: randomUUID(),
                expiring: false,
                expiresAt: null,
            },
        ];

        handler = new EventComponentCleanerHandler({ repository });
    });

    it('sweeps expired rows through the repository port', async () => {
        // the cleaner must not reach for the data source itself: the batching,
        // the id-only select and the delete-by-id all live behind the port.
        await handler.handle();

        expect(repository.deleteExpiredCalls).toHaveLength(1);
        expect(repository.rows).toHaveLength(2);
    });

    it('passes the sweep instant as an ISO-8601 timestamp', async () => {
        // `expiresAt` is a varchar compared lexicographically, so any other
        // stamp format would silently select the wrong rows.
        await handler.handle();

        const [call] = repository.deleteExpiredCalls;
        expect(call.now).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
});
