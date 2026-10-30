/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { BucketFileEventDispatcher, BucketFileEventMessageBusRouting } from '@privateaim/server-storage-kit';
import type { Message } from 'hubwire';
import { MemoryMessageBusDriver, MessageBus } from 'hubwire';
import { describe, expect, it } from 'vitest';
import { BucketFileComponent } from '../../../../../src/app/components/bucket-file/module.ts';
import { BucketFileDispatcherAdapter } from '../../../../../src/app/modules/http/dispatchers/bucket-file-dispatcher.ts';
import { FakeStorageAdapter } from '../../../core/entities/bucket/fake-storage.ts';

describe('src/app/modules/http/dispatchers/bucket-file-dispatcher', () => {
    it('should forward every event of one command with one correlationId', async () => {
        const messageBus = new MessageBus({ driver: new MemoryMessageBusDriver() });
        const messages: Message[] = [];

        await messageBus.consumeAny(BucketFileEventMessageBusRouting, async (message) => {
            messages.push(message);
        });

        const adapter = new BucketFileDispatcherAdapter(
            new BucketFileComponent({ storage: new FakeStorageAdapter() }),
            new BucketFileEventDispatcher({ messageBus }),
        );

        // unknown id: DELETION_STARTED, then DELETION_FAILED
        await expect(adapter.delete(randomUUID())).rejects.toBeDefined();
        await new Promise((resolve) => {
            setImmediate(resolve);
        });

        expect(messages).toHaveLength(2);
        expect(messages[0].metadata.correlationId).toBeTypeOf('string');
        expect(messages[1].metadata.correlationId).toBe(messages[0].metadata.correlationId);

        await messageBus.close();
    });
});
