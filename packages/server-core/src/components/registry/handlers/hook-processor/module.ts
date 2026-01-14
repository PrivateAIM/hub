/*
 * Copyright (c) 2023-2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ComponentData, ComponentHandler } from '@privateaim/server-kit';
import { useLogger } from '@privateaim/server-kit';
import type { RegistryCommand } from '../../constants.ts';
import type { RegistryEventMap } from '../../type.ts';
import { RegistryHookValidator } from './validator.ts';

export class RegistryHookHandler implements ComponentHandler<
RegistryEventMap,
RegistryCommand.HOOK_PROCESS
> {
    protected validator : RegistryHookValidator;

    constructor() {
        this.validator = new RegistryHookValidator();
    }

    async handle(
        value: ComponentData,
    ): Promise<void> {
        try {
            const data = await this.validator.run(value);

            useLogger()
                .debug(`Registry event ${data.type} unhandled.`);
        } catch (e) {
            useLogger()
                .warn(`Registry event ${value.t} malformed.`);
        }
    }
}
