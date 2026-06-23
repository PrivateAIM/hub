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
} from 'vitest';
import type { IMessageRepository, MessagePersistInput } from '../../../../../src/core/entities/message/types.ts';
import { createTestDatabaseApplication } from '../../../../app/factory.ts';
import type { TestApplication } from '../../../../app/module.ts';

const SENDER_ID = randomUUID();

function persistInput(recipientId: string, data: string, expiresAtEpoch = Date.now() + 60_000): MessagePersistInput {
    return {
        sender_type: 'user',
        sender_id: SENDER_ID,
        recipient_type: 'client',
        recipient_id: recipientId,
        data,
        metadata: { analysisId: 'analysis-1' },
        expires_at: `${expiresAtEpoch}`,
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

    it('should persist messages with a generated id and created_at', async () => {
        const recipient = randomUUID();
        const created = await repository.createMany([persistInput(recipient, 'a'), persistInput(recipient, 'b')]);

        expect(created).toHaveLength(2);
        expect(created[0].id).toBeDefined();
        expect(created[0].created_at).toBeInstanceOf(Date);
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
});
