/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentHandler } from '@privateaim/server-kit';
import { LogValidator } from '@privateaim/telemetry-kit';
import { useLogStore } from '../../../../services';
import type { LogCommand } from '../../constants';
import type { LogWriteCommandPayload } from './types';

export class LogComponentWriteHandler implements ComponentHandler<
LogCommand.WRITE,
LogWriteCommandPayload
> {
    protected validator : LogValidator;

    constructor() {
        this.validator = new LogValidator();
    }

    async execute(
        input: LogWriteCommandPayload,
    ): Promise<void> {
        const data = await this.validator.run(input);

        const logStore = useLogStore();
        await logStore.write(data);
    }
}
