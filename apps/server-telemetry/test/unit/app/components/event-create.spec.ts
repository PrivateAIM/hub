/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Event } from '@privateaim/telemetry-kit';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { EventComponentCreateHandler } from '../../../../src/app/components/event/handlers/create/module.ts';
import { createTestDatabaseApplication } from '../../../app/factory.ts';

// `process()` reaches for `useDataSource()` directly rather than going through
// IEventRepository, so this has to be database-backed. The suite already boots a
// container in globalSetup, so it costs nothing extra.
const suite = createTestDatabaseApplication();

// The component contract only ever calls `handle`, and the handler passes its
// own event names through it — a plain literal is the fake.
const context = {
    key: 'create',
    metadata: {},
    handle: async () => {},
} as any;

const basePayload: Partial<Event> = {
    refType: 'project',
    scope: 'entity',
    name: 'created',
};

async function persist(handler: EventComponentCreateHandler, payload: Partial<Event>) {
    const rows: Event[] = [];
    await handler.process(
        payload,
        { ...context, handle: async (_name: string, entity: Event) => { rows.push(entity); } },
    );

    return rows[rows.length - 1];
}

describe('app/components/event/handlers/create', () => {
    beforeAll(async () => {
        await suite.setup();
    });

    afterAll(async () => {
        await suite.teardown();
    });

    it('stamps the configured retention window when the publisher supplied none', async () => {
        const handler = new EventComponentCreateHandler({ retentionDays: 3 });
        const entity = await persist(handler, basePayload);

        expect(entity.expiring).toBe(true);
        // ±1min tolerance: the stamp is taken inside process().
        expect(Date.parse(entity.expiresAt as string))
            .toBeGreaterThan(Date.now() + (3 * 24 * 60 * 60 * 1000) - 60_000);
        expect(Date.parse(entity.expiresAt as string))
            .toBeLessThan(Date.now() + (3 * 24 * 60 * 60 * 1000) + 60_000);
    });

    it('keeps rows forever when retention is 0', async () => {
        const handler = new EventComponentCreateHandler({ retentionDays: 0 });
        const entity = await persist(handler, basePayload);

        // the persisted row materializes the nullable column as SQL NULL
        expect(entity.expiresAt ?? null).toBeNull();
    });

    it('lets an explicit publisher override win', async () => {
        const handler = new EventComponentCreateHandler({ retentionDays: 3 });
        const expiresAt = new Date(Date.now() + 600_000).toISOString();

        const stamped = await persist(handler, { ...basePayload, expiresAt });
        expect(stamped.expiresAt).toBe(expiresAt);
        // `expiring` is the sweep predicate — an expiry with expiring:false
        // would be a row the cleaner can never delete.
        expect(stamped.expiring).toBe(true);

        // `expiring: false` means "keep forever" and must not be overwritten.
        const optedOut = await persist(handler, { ...basePayload, expiring: false });
        expect(optedOut.expiring).toBe(false);
        expect(optedOut.expiresAt ?? null).toBeNull();
    });
});
