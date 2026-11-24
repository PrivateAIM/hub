/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RegistryAPICommand } from '@privateaim/core-kit';
import { ServiceID } from '@privateaim/core-kit';
import {
    DBody,
    DConsumes,
    DContext,
    DController,
    DPost,
    DStatus,
    DTags,
} from '@routup/decorators';

import { EntityNotFoundError } from '@privateaim/errors';
import type { IAppEvent } from 'routup';
import { ForceLoggedInMiddleware, buildActorContext } from '@privateaim/server-http-kit';
import type { IRegistryDispatcher } from '../../../../../core/harbor/types.ts';
import type { IRegistryService } from '../../../../../core/index.ts';

type ServiceControllerContext = {
    registryService: IRegistryService;
    registryDispatcher: IRegistryDispatcher;
};

@DTags('extra')
@DController('/services')
export class ServiceController {
    protected registryService: IRegistryService;

    protected registryDispatcher: IRegistryDispatcher;

    constructor(ctx: ServiceControllerContext) {
        this.registryService = ctx.registryService;
        this.registryDispatcher = ctx.registryDispatcher;
    }

    @DPost('/:id/hook', [ForceLoggedInMiddleware])
    @DConsumes('application/json')
    @DStatus(202)
    async handleHarborHook(
        @DContext() event: IAppEvent,
        @DBody() data: Record<string, any>,
    ) {
        const { id } = event.params;

        if (id !== ServiceID.REGISTRY) {
            throw new EntityNotFoundError({ entity: 'service' });
        }

        await this.registryDispatcher.dispatch('HOOK_PROCESS', data, {});

        return null;
    }

    @DPost('/:id/command', [ForceLoggedInMiddleware])
    @DConsumes('application/json')
    @DStatus(202)
    async execHarborTask(
        @DContext() event: IAppEvent,
        @DBody() data: {
            command: RegistryAPICommand;
            id: string;
            secret?: string
        },
    ) {
        const { id } = event.params;

        if (id !== ServiceID.REGISTRY) {
            throw new EntityNotFoundError({ entity: 'service' });
        }

        const actor = buildActorContext(event);

        await this.registryService.executeCommand(data.command, data, actor);

        return null;
    }
}
