/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import { EventEntity } from '../../../../../src/adapters/database/entities/event.ts';
import { EVENT_RETENTION_SWEEP_BATCH_SIZE } from '../../../../../src/core/entities/index.ts';
import { EventRepositoryAdapter } from '../../../../../src/app/modules/database/repositories/event/repository.ts';
import { createTestDatabaseApplication } from '../../../../app/factory.ts';
import type { TestApplication } from '../../../../app/module.ts';

describe('app/modules/database/repositories/event', () => {
    let app: TestApplication;
    let adapter: EventRepositoryAdapter;

    beforeAll(async () => {
        app = createTestDatabaseApplication();
        await app.setup();

        adapter = new EventRepositoryAdapter(app.dataSource);
    });

    afterAll(async () => {
        await app.teardown();
    });

    const record = async (refId: string, options: { expiring: boolean, expiresAt?: string }) => {
        const repository = app.dataSource.getRepository(EventEntity);

        await repository.save(repository.create({
            scope: 'entity',
            name: 'created',
            refType: 'project',
            refId,
            expiring: options.expiring,
            expiresAt: options.expiresAt ?? null,
        }));
    };

    const countByRef = async (refId: string) => app.dataSource
        .getRepository(EventEntity)
        .countBy({ refId });

    const past = () => new Date(Date.now() - 60_000).toISOString();

    describe('deleteExpired', () => {
        it('drains every expired row across several batches', async () => {
            // The sweep must never issue one unbounded statement: the first run
            // after a retention change can match millions of rows. Batching only
            // holds if the loop also DRAINS — a single bounded statement would
            // silently leave a permanent backlog behind.
            const refId = `sweep-batch-${randomUUID()}`;
            for (let i = 0; i < 5; i++) {
                await record(refId, { expiring: true, expiresAt: past() });
            }

            const deleted = await adapter.deleteExpired(
                new Date().toISOString(),
                { batchSize: 2 },
            );

            expect(deleted).toBeGreaterThanOrEqual(5);
            expect(await countByRef(refId)).toEqual(0);
        });

        it('bounds each statement to the batch size', async () => {
            const refId = `sweep-bound-${randomUUID()}`;
            for (let i = 0; i < 5; i++) {
                await record(refId, { expiring: true, expiresAt: past() });
            }

            const ormRepository = app.dataSource.getRepository(EventEntity);
            const findSpy = vi.spyOn(ormRepository, 'find');
            const deleteSpy = vi.spyOn(ormRepository, 'delete');

            await adapter.deleteExpired(new Date().toISOString(), { batchSize: 2 });

            // 5 rows at 2 per batch: three DELETEs rather than one sweeping
            // statement. Each is fed by a select bounded to the batch size,
            // which is what keeps the DELETE itself bounded.
            expect(deleteSpy).toHaveBeenCalledTimes(3);
            // asserted so the bound check below can never pass vacuously
            expect(findSpy).toHaveBeenCalledTimes(3);
            for (const [options] of findSpy.mock.calls) {
                expect(options?.take).toEqual(2);
            }

            findSpy.mockRestore();
            deleteSpy.mockRestore();
        });

        it.each([0, -1, 2.5, Infinity, NaN])(
            'falls back to the default batch size for an unusable batchSize (%s)',
            async (batchSize) => {
                // A batchSize of 0 is the one that matters: typeorm ignores a
                // falsy take, so the sweep would silently revert to the single
                // unbounded statement this batching exists to prevent. The rest
                // would reach the driver as invalid SQL. Neither is reachable
                // today, but the option sits on a port, so pin the fallback.
                const refId = `sweep-guard-${randomUUID()}`;
                await record(refId, { expiring: true, expiresAt: past() });

                const ormRepository = app.dataSource.getRepository(EventEntity);
                const findSpy = vi.spyOn(ormRepository, 'find');

                await adapter.deleteExpired(new Date().toISOString(), { batchSize });

                expect(findSpy).toHaveBeenCalled();
                for (const [options] of findSpy.mock.calls) {
                    expect(options?.take).toEqual(EVENT_RETENTION_SWEEP_BATCH_SIZE);
                }

                findSpy.mockRestore();
            },
        );

        it('keeps rows that have not expired and rows that never expire', async () => {
            const refId = `sweep-keep-${randomUUID()}`;

            await record(refId, {
                expiring: true,
                expiresAt: new Date(Date.now() + 600_000).toISOString(),
            });
            await record(refId, { expiring: false });

            await adapter.deleteExpired(new Date().toISOString());

            // scoped to this test's own rows: the sweep is table-wide, so a
            // global deleted-count assertion would couple this to whatever
            // other specs happen to leave behind.
            expect(await countByRef(refId)).toEqual(2);
        });
    });
});
