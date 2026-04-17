/*
 * Copyright (c) 2023-2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ComponentData, ComponentHandler, Logger } from '@privateaim/server-kit';
import type { RegistryCommand } from '../../constants.ts';
import type { RegistryEventMap } from '../../type.ts';
import { RegistryHookValidator } from './validator.ts';

export class RegistryHookHandler implements ComponentHandler<
    RegistryEventMap,
    RegistryCommand.HOOK_PROCESS
> {
    protected validator : RegistryHookValidator;

    protected logger?: Logger;

    constructor(ctx: { logger?: Logger } = {}) {
        this.validator = new RegistryHookValidator();
        this.logger = ctx.logger;
    }

    async handle(
        value: ComponentData,
    ): Promise<void> {
        try {
            const data = await this.validator.run(value);

            this.logger?.debug(`Registry event ${data.type} unhandled.`);
        } catch {
            this.logger?.warn(`Registry event ${value.t} malformed.`);
        }
    }
}
