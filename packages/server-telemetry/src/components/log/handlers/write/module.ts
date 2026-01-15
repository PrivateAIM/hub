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
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import type { Request } from 'routup';
import type { LogStore } from '../../../../services/index.ts';
import { useLogStore } from '../../../../services/index.ts';

export class LogComponentWriteHandler implements ComponentHandler {
    protected validator : LogValidator;

    protected store : LogStore;

    constructor() {
        this.validator = new LogValidator();
        this.store = useLogStore();
    }

    async handle(
        input: LogWriteCommandPayload,
    ): Promise<void> {
        const data = await this.validate(input);

        await this.write(data);
    }

    async validate(input: LogWriteCommandPayload) : Promise<LogInput> {
        return this.validator.run(input);
    }

    async validateWithRequest(request: Request) : Promise<LogInput> {
        const validatorAdapter = new RoutupContainerAdapter(this.validator);
        return validatorAdapter.run(request);
    }

    async write(value: LogInput) : Promise<Log> {
        return this.store.write(value);
    }
}
