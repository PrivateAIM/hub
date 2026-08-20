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
import { MESSAGE_SWEEP_BATCH_SIZE } from '../../../../../src/core/entities/message/constants.ts';
import type { IMessageRepository, MessagePersistInput } from '../../../../../src/core/entities/message/types.ts';
import { MessageEntity } from '../../../../../src/adapters/database/entities/message.ts';
import { MessageRepositoryAdapter } from '../../../../../src/app/modules/database/repositories/message/repository.ts';
import { createTestDatabaseApplication } from '../../../../app/factory.ts';
import type { TestApplication } from '../../../../app/module.ts';

const SENDER_ID = randomUUID();

function persistInput(recipientId: string, data: string, expiresAtEpoch = Date.now() + 60_000): MessagePersistInput {
    return {
        senderType: 'user',
        senderId: SENDER_ID,
        recipientType: 'client',
        recipientId,
        data,
        metadata: { analysisId: 'analysis-1' },
        expiresAt: new Date(expiresAtEpoch).toISOString(),
    };
}

describe('database/message-repository', () => {
    let app: TestApplication;
    let repository: IMessageRepository;

    beforeAll(async () => {
        app = createTestDatabaseApplication();
        await app.setup();
        repository = app.messageRepository;
    });

    afterAll(async () => {
        await app.teardown();
    });

    // no global cleanup: every test uses unique random recipient ids, so they are
    // isolated even on the shared CI matrix database.

    it('should persist messages with a generated id and createdAt', async () => {
        const recipient = randomUUID();
        const created = await repository.createMany([persistInput(recipient, 'a'), persistInput(recipient, 'b')]);

        expect(created).toHaveLength(2);
        expect(created[0].id).toBeDefined();
        expect(created[0].createdAt).toBeDefined();
        expect(Number.isNaN(new Date(created[0].createdAt).getTime())).toBe(false);
        expect(created[0].metadata).toEqual({ analysisId: 'analysis-1' });
    });

    it('should pull recipient-scoped messages and delete them on ack', async () => {
        const recipientA = randomUUID();
        const recipientB = randomUUID();
        await repository.createMany([
            persistInput(recipientA, 'x'),
            persistInput(recipientA, 'y'),
            persistInput(recipientB, 'z'),
        ]);

        const forA = await repository.findManyForRecipient({ type: 'client', id: recipientA }, 50);
        expect(forA.map((m) => m.data).sort()).toEqual(['x', 'y']);

        const forB = await repository.findManyForRecipient({ type: 'client', id: recipientB }, 50);
        expect(forB).toHaveLength(1);

        await repository.ackByIds({ type: 'client', id: recipientA }, [forA[0].id]);
        const afterAck = await repository.findManyForRecipient({ type: 'client', id: recipientA }, 50);
        expect(afterAck).toHaveLength(1);
        expect(afterAck[0].id).toBe(forA[1].id);
    });

    it('should respect the pull limit', async () => {
        const recipient = randomUUID();
        await repository.createMany([
            persistInput(recipient, '1'),
            persistInput(recipient, '2'),
            persistInput(recipient, '3'),
        ]);

        const limited = await repository.findManyForRecipient({ type: 'client', id: recipient }, 2);
        expect(limited).toHaveLength(2);
    });

    it('should sweep expired messages and keep unexpired ones', async () => {
        const recipient = randomUUID();
        await repository.createMany([
            persistInput(recipient, 'expired', Date.now() - 60_000),
            persistInput(recipient, 'fresh', Date.now() + 60_000),
        ]);

        const removed = await repository.deleteExpired(new Date());
        expect(removed).toBeGreaterThanOrEqual(1);

        const remaining = await repository.findManyForRecipient({ type: 'client', id: recipient }, 50);
        expect(remaining.map((m) => m.data)).toEqual(['fresh']);
    });

    describe('deleteExpired batching', () => {
        const seedExpired = async (recipient: string, count: number) => {
            await repository.createMany(
                Array.from({ length: count }, (_, i) => persistInput(recipient, `${i}`, Date.now() - 60_000)),
            );
        };

        it('should drain every expired message across several batches', async () => {
            // the sweep runs every 60s on every replica; a bounded statement
            // that does not loop would leave a permanent backlog behind.
            const recipient = randomUUID();
            await seedExpired(recipient, 5);

            await repository.deleteExpired(new Date(), { batchSize: 2 });

            const remaining = await repository.findManyForRecipient({ type: 'client', id: recipient }, 50);
            expect(remaining).toHaveLength(0);
        });

        it('should bound each statement to the batch size', async () => {
            const recipient = randomUUID();
            await seedExpired(recipient, 5);

            const ormRepository = app.dataSource.getRepository(MessageEntity);
            const adapter = new MessageRepositoryAdapter(app.dataSource);
            const findSpy = vi.spyOn(ormRepository, 'find');
            const deleteSpy = vi.spyOn(ormRepository, 'delete');

            await adapter.deleteExpired(new Date(), { batchSize: 2 });

            // at least three rounds for this test's own five rows, rather than
            // one sweeping DELETE over the whole mailbox
            expect(deleteSpy.mock.calls.length).toBeGreaterThanOrEqual(3);
            // asserted so the bound check below can never pass vacuously
            expect(findSpy).toHaveBeenCalled();
            for (const [options] of findSpy.mock.calls) {
                expect(options?.take).toEqual(2);
            }

            findSpy.mockRestore();
            deleteSpy.mockRestore();
        });

        it.each([0, -1, 2.5, Number.POSITIVE_INFINITY, Number.NaN])(
            'should fall back to the default batch size for an unusable batchSize (%s)',
            async (batchSize) => {
                // a batchSize of 0 is the one that matters: typeorm ignores a
                // falsy take, silently restoring the unbounded sweep this
                // batching exists to prevent.
                const recipient = randomUUID();
                await seedExpired(recipient, 1);

                const ormRepository = app.dataSource.getRepository(MessageEntity);
                const adapter = new MessageRepositoryAdapter(app.dataSource);
                const findSpy = vi.spyOn(ormRepository, 'find');

                await adapter.deleteExpired(new Date(), { batchSize });

                expect(findSpy).toHaveBeenCalled();
                for (const [options] of findSpy.mock.calls) {
                    expect(options?.take).toEqual(MESSAGE_SWEEP_BATCH_SIZE);
                }

                findSpy.mockRestore();
            },
        );
    });
});
