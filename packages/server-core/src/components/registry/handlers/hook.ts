/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { type ComponentHandler, useLogger } from '@privateaim/server-kit';
import type { RegistryCommand } from '../constants';
import type { RegistryEventMap, RegistryEventPayload } from '../type';

export class RegistryHookHandler implements ComponentHandler<
RegistryEventMap,
RegistryCommand.HOOK_HANDLE
> {
    async handle(
        value: RegistryEventPayload,
    ): Promise<void> {
        useLogger()
            .debug(`Registry event ${value.event} unhandled.`);
    }
}
