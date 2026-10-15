/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';
import type { ComponentHandler } from 'ergos';
import type { Log, LogInput } from '@privateaim/telemetry-kit';
import { LogValidator } from '@privateaim/telemetry-kit';
import type { LogWriteCommandPayload } from '@privateaim/server-telemetry-kit';
import type { LogStore } from '../../../../../core/services/log-store/types.ts';
import { isValidupError } from 'validup';
import { MemoryLogStore } from '../../../../../adapters/telemetry/memory.ts';

export class LogComponentWriteHandler implements ComponentHandler {
    protected validator : LogValidator;

    protected store : LogStore;

    protected logger?: Logger;

    /**
     * The logger must not write through the log queue (telemetry's own logger
     * writes to a MemoryLogStore), or a dropped line would enqueue another.
     */
    constructor(logStore?: LogStore, logger?: Logger) {
        this.validator = new LogValidator();
        this.store = logStore ?? new MemoryLogStore();
        this.logger = logger;
    }

    async handle(
        input: LogWriteCommandPayload,
    ): Promise<void> {
        let data: LogInput;
        try {
            data = await this.validate(input);
        } catch (e) {
            // An invalid log line stays invalid: drop it instead of letting the
            // message bus retry it (with backoff) on the shared log queue.
            // Not logged — this IS the log writer.
            if (isValidupError(e)) {
                return;
            }

            throw e;
        }

        try {
            await this.write(data);
        } catch (e) {
            // Drop instead of retrying: a retry holds the queue's single
            // prefetch slot through its backoff, so a store outage would cut
            // throughput to a few lines a minute and pile up every service's
            // log lines in the broker. A lost log line is the cheaper failure.
            this.logger?.warn(`Dropping log line, the log store rejected it: ${e instanceof Error ? e.message : String(e)}`);
        }
    }

    async validate(input: LogWriteCommandPayload) : Promise<LogInput> {
        return this.validator.run(input);
    }

    async write(value: LogInput) : Promise<Log> {
        return this.store.write(value);
    }
}
