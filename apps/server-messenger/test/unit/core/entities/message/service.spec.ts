/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import {
    describe, 
    expect, 
    it,
} from 'vitest';
import type { ActorContext } from '@privateaim/server-kit';
import { FakePermissionChecker } from '@privateaim/server-test-kit';
import { MessageService } from '../../../../../src/core/entities/message/service.ts';
import type { IMessageWakeup } from '../../../../../src/core/services/wakeup/index.ts';
import { FakeMessageRepository } from './fake-repository.ts';

function actorFor(id: string, type: 'user' | 'robot' | 'client' = 'client'): ActorContext {
    return {
        permissionChecker: new FakePermissionChecker(),
        realm: { id: 'realm-1', name: 'master' },
        identity: { id, type },
        metadata: {},
    };
}

describe('core/entities/message/service', () => {
    it('should persist one row per recipient with the sender derived from the actor', async () => {
        const repository = new FakeMessageRepository();
        const service = new MessageService({ repository });

        const recipientA = randomUUID();
        const recipientB = randomUUID();
        const sender = randomUUID();

        const messages = await service.send({
            recipients: [{ type: 'client', id: recipientA }, { type: 'client', id: recipientB }],
            data: 'hello',
            metadata: { analysisId: 'analysis-1' },
        }, actorFor(sender, 'user'));

        expect(messages).toHaveLength(2);
        expect(messages[0].sender_type).toBe('user');
        expect(messages[0].sender_id).toBe(sender);
        expect(messages.map((m) => m.recipient_id).sort()).toEqual([recipientA, recipientB].sort());
        expect(messages[0].metadata).toEqual({ analysisId: 'analysis-1' });
    });

    it('should pull only the recipient\'s own messages and delete them on ack', async () => {
        const repository = new FakeMessageRepository();
        const service = new MessageService({ repository });

        const recipientA = randomUUID();
        const recipientB = randomUUID();

        await service.send({ recipients: [{ type: 'client', id: recipientA }], data: 'm1' }, actorFor(randomUUID(), 'user'));
        await service.send({ recipients: [{ type: 'client', id: recipientB }], data: 'm2' }, actorFor(randomUUID(), 'user'));

        const recipient = actorFor(recipientA, 'client');

        const pulled = await service.pull({}, recipient);
        expect(pulled.messages).toHaveLength(1);
        expect(pulled.messages[0].data).toBe('m1');

        await service.ack({ ids: pulled.messages.map((m) => m.id) }, recipient);

        const after = await service.pull({}, recipient);
        expect(after.messages).toHaveLength(0);
    });

    it('should reject a send without recipients', async () => {
        const service = new MessageService({ repository: new FakeMessageRepository() });
        await expect(
            service.send({ recipients: [] }, actorFor(randomUUID(), 'user')),
        ).rejects.toThrow();
    });

    it('should reject a recipient id that is not a uuid', async () => {
        const service = new MessageService({ repository: new FakeMessageRepository() });
        await expect(
            service.send({ recipients: [{ type: 'client', id: 'not-a-uuid' }] }, actorFor(randomUUID(), 'user')),
        ).rejects.toThrow();
    });

    it('should reject an ack without ids', async () => {
        const service = new MessageService({ repository: new FakeMessageRepository() });
        await expect(
            service.ack({ ids: [] }, actorFor(randomUUID(), 'client')),
        ).rejects.toThrow();
    });

    it('should long-poll and resolve once a message arrives for the recipient', async () => {
        const repository = new FakeMessageRepository();
        const service = new MessageService({ repository });

        const recipientId = randomUUID();
        const recipient = actorFor(recipientId, 'client');

        const pullPromise = service.pull({ wait: 5000 }, recipient);
        // let the pull find nothing and park before the message is sent
        await new Promise((resolve) => { setImmediate(resolve); });

        await service.send(
            { recipients: [{ type: 'client', id: recipientId }], data: 'delivered' },
            actorFor(randomUUID(), 'user'),
        );

        const result = await pullPromise;
        expect(result.messages).toHaveLength(1);
        expect(result.messages[0].data).toBe('delivered');
    });

    it('should long-poll and return empty after the wait budget with no message', async () => {
        const service = new MessageService({ repository: new FakeMessageRepository() });

        const start = Date.now();
        const result = await service.pull({ wait: 30 }, actorFor(randomUUID(), 'client'));
        expect(result.messages).toHaveLength(0);
        expect(Date.now() - start).toBeGreaterThanOrEqual(20);
    });

    it('should still succeed when the wakeup fails (best-effort, already-durable send)', async () => {
        const repository = new FakeMessageRepository();
        const failingWakeup: IMessageWakeup = {
            notify: async () => { throw new Error('redis down'); },
            wait: async () => {},
            subscribe: () => () => {},
        };
        const service = new MessageService({ repository, wakeup: failingWakeup });

        const messages = await service.send(
            { recipients: [{ type: 'client', id: randomUUID() }], data: 'x' },
            actorFor(randomUUID(), 'user'),
        );

        expect(messages).toHaveLength(1);
        expect(repository.messages).toHaveLength(1);
    });
});
