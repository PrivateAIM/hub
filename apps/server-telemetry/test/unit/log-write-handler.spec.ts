/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import type { Logger } from '@privateaim/server-kit';
import type { Log } from '@privateaim/telemetry-kit';
import { LogChannel, LogLevel } from '@privateaim/telemetry-kit';
import { MemoryLogStore } from '../../src/adapters/telemetry/memory.ts';
import { LogComponentWriteHandler } from '../../src/app/components/log/handlers/index.ts';

class FailingLogStore extends MemoryLogStore {
    async write(): Promise<Log> {
        throw new Error('store unavailable');
    }
}

function createRecordingLogger() {
    const warnings: string[] = [];
    const noop = () => logger;
    const logger: Logger = {
        emerg: noop,
        alert: noop,
        crit: noop,
        error: noop,
        warn: (message: unknown) => {
            warnings.push(String(message));
            return logger;
        },
        notice: noop,
        info: noop,
        debug: noop,
    };

    return { logger, warnings };
}

const input = {
    message: 'hello',
    level: LogLevel.INFORMATIONAL,
    channel: LogChannel.SYSTEM,
    service: 'test-service',
};

describe('LogComponentWriteHandler', () => {
    it('should write a valid log line to the store', async () => {
        const store = new MemoryLogStore();
        const handler = new LogComponentWriteHandler(store);

        await handler.handle(input);

        expect(store.items).toHaveLength(1);
    });

    it('should drop a line the store rejects instead of throwing into a retry', async () => {
        const { logger, warnings } = createRecordingLogger();
        const handler = new LogComponentWriteHandler(new FailingLogStore(), logger);

        await expect(handler.handle(input)).resolves.toBeUndefined();
        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toContain('store unavailable');
    });
});
