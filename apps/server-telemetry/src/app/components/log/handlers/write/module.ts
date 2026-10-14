/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentHandler } from '@privateaim/server-kit';
import type { Log, LogInput } from '@privateaim/telemetry-kit';
import { LogValidator } from '@privateaim/telemetry-kit';
import type { LogWriteCommandPayload } from '@privateaim/server-telemetry-kit';
import type { LogStore } from '../../../../../core/services/log-store/types.ts';
import { isValidupError } from 'validup';
import { MemoryLogStore } from '../../../../../adapters/telemetry/memory.ts';

export class LogComponentWriteHandler implements ComponentHandler {
    protected validator : LogValidator;

    protected store : LogStore;

    constructor(logStore?: LogStore) {
        this.validator = new LogValidator();
        this.store = logStore ?? new MemoryLogStore();
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

        await this.write(data);
    }

    async validate(input: LogWriteCommandPayload) : Promise<LogInput> {
        return this.validator.run(input);
    }

    async write(value: LogInput) : Promise<Log> {
        return this.store.write(value);
    }
}
