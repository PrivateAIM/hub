/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import {
    AmqpMessageBusDriver,
    buildMessageBusPublishPayload,
    serializeMessageBusPayload,
} from '../../src';
import type { MessageBusPayload, MessageBusRouting } from '../../src';

const work: MessageBusRouting = { type: 'work', key: 'tasks' };
const pubSub: MessageBusRouting = { type: 'pubSub', key: 'events' };

/**
 * Never touches a broker: the client is created lazily and `publish` is
 * replaced by a recorder.
 */
class TestDriver extends AmqpMessageBusDriver {
    published: MessageBusPayload[] = [];

    constructor(maxAttempts = 3) {
        super({
            connectionString: 'amqp://unused', 
            maxAttempts, 
            retryDelay: 0, 
        });
    }

    async publish(_routing: MessageBusRouting, message: MessageBusPayload): Promise<boolean> {
        this.published.push(message);
        return true;
    }

    run(
        routing: MessageBusRouting,
        message: MessageBusPayload,
        handler: (payload: MessageBusPayload) => Promise<void> | void,
        redelivered = false,
    ) {
        return this.deliver(routing, {
            content: Buffer.from(serializeMessageBusPayload(message)),
            fields: { redelivered },
        }, handler);
    }
}

function createMessage(routing: MessageBusRouting, attempt?: number) {
    return buildMessageBusPublishPayload({
        type: 'execute',
        data: { id: 'a' },
        metadata: { routing, attempt },
    });
}

const fail = () => {
    throw new Error('boom');
};

describe('src/message-bus/driver/amqp', () => {
    it('should handle a fresh work message once, without retry', async () => {
        const driver = new TestDriver();
        const handled: string[] = [];

        await driver.run(work, createMessage(work), (payload) => {
            handled.push(payload.type);
        });

        expect(handled).toEqual(['execute']);
        expect(driver.published).toHaveLength(0);
    });

    it('should re-publish a failed work message with an incremented attempt', async () => {
        const driver = new TestDriver();
        const message = createMessage(work);

        await driver.run(work, message, fail);

        expect(driver.published).toHaveLength(1);
        expect(driver.published[0].id).toBe(message.id);
        expect(driver.published[0].metadata.attempt).toBe(2);
    });

    it('should count a redelivery as a failed attempt instead of dropping it', async () => {
        const driver = new TestDriver();
        const handled: string[] = [];

        await driver.run(work, createMessage(work, 2), (payload) => {
            handled.push(payload.type);
        }, true);

        expect(handled).toEqual([]);
        expect(driver.published[0].metadata.attempt).toBe(3);
    });

    it('should skip a redelivery of a message this process is still handling', async () => {
        const driver = new TestDriver();
        const message = createMessage(work);

        const { promise, resolve } = Promise.withResolvers<void>();
        const running = driver.run(work, message, () => promise);

        await driver.run(work, message, () => {}, true);
        expect(driver.published).toHaveLength(0);

        resolve();
        await running;

        // once finished, a redelivery is a crashed attempt again
        await driver.run(work, message, () => {}, true);
        expect(driver.published).toHaveLength(1);
    });

    it('should drop a work message once its attempts are exhausted', async () => {
        const driver = new TestDriver(3);

        await driver.run(work, createMessage(work, 3), fail);
        await driver.run(work, createMessage(work, 3), () => {}, true);

        expect(driver.published).toHaveLength(0);
    });

    it('should not retry pub/sub messages', async () => {
        const driver = new TestDriver();

        await expect(driver.run(pubSub, createMessage(pubSub), fail)).rejects.toThrow('boom');
        expect(driver.published).toHaveLength(0);
    });

    it('should serialize errors in a payload instead of emitting {}', () => {
        const error = Object.assign(new Error('registry unavailable'), { code: 'registryNotFound' });
        const message = buildMessageBusPublishPayload({
            type: 'executionFailed',
            data: { id: 'a', error },
            metadata: { routing: work },
        });

        const parsed = JSON.parse(serializeMessageBusPayload(message));
        expect(parsed.data.error).toEqual({
            name: 'Error',
            message: 'registry unavailable',
            code: 'registryNotFound',
        });
    });
});
