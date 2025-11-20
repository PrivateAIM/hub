/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentHandler, ComponentHandlerContext } from '@privateaim/server-kit';
import type { RegistryEventMap, RegistryProjectRelinkPayload } from '../../type';
import { RegistryCommand } from '../../constants';

export class RegistryProjectRelinkHandler implements ComponentHandler<
RegistryEventMap,
RegistryCommand.PROJECT_RELINK
> {
    async handle(
        value: RegistryProjectRelinkPayload,
        context: ComponentHandlerContext<RegistryEventMap, RegistryCommand.PROJECT_RELINK>,
    ): Promise<void> {
        await context.handle(RegistryCommand.PROJECT_UNLINK, value);
        await context.handle(RegistryCommand.PROJECT_LINK, value);
    }
}
