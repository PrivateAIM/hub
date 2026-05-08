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
    DContext,
    DController,
    DPost,
    DTags,
} from '@routup/decorators';

import { NotFoundError } from '@ebec/http';
import type { IRoutupEvent } from 'routup';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { IRegistryCaller } from '../../../../../core/harbor/types.ts';
import type { IRegistryService } from '../../../../../core/index.ts';
import { buildActorContext } from '../../../request/index.ts';

type ServiceControllerContext = {
    registryService: IRegistryService;
    registryCaller: IRegistryCaller;
};

@DTags('extra')
@DController('/services')
export class ServiceController {
    protected registryService: IRegistryService;

    protected registryCaller: IRegistryCaller;

    constructor(ctx: ServiceControllerContext) {
        this.registryService = ctx.registryService;
        this.registryCaller = ctx.registryCaller;
    }

    @DPost('/:id/hook', [ForceLoggedInMiddleware])
    async handleHarborHook(
        @DContext() event: IRoutupEvent,
        @DBody() data: Record<string, any>,
    ) {
        const { id } = event.params;

        if (id !== ServiceID.REGISTRY) {
            throw new NotFoundError();
        }

        await this.registryCaller.call('HOOK_PROCESS', data, {});

        event.response.status = 202;
        return null;
    }

    @DPost('/:id/command', [ForceLoggedInMiddleware])
    async execHarborTask(
        @DContext() event: IRoutupEvent,
        @DBody() data: {
            command: RegistryAPICommand;
            id: string;
            secret?: string
        },
    ) {
        const { id } = event.params;

        if (id !== ServiceID.REGISTRY) {
            throw new NotFoundError();
        }

        const actor = buildActorContext(event);
        await this.registryService.executeCommand(data.command, data, actor);

        event.response.status = 202;
        return null;
    }
}
