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
    DController,
    DPost,
    DRequest,
    DResponse,
    DTags,
} from '@routup/decorators';

import { NotFoundError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
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
        @DRequest() req: Request,
        @DResponse() res: Response,
        @DBody() data: Record<string, any>,
    ) {
        const id = useRequestParam(req, 'id');

        if (id !== ServiceID.REGISTRY) {
            throw new NotFoundError();
        }

        await this.registryCaller.call('HOOK_PROCESS', data, {});

        return sendAccepted(res);
    }

    @DPost('/:id/command', [ForceLoggedInMiddleware])
    async execHarborTask(
        @DRequest() req: Request,
        @DResponse() res: Response,
        @DBody() data: {
            command: RegistryAPICommand; 
            id: string; 
            secret?: string 
        },
    ) {
        const id = useRequestParam(req, 'id');

        if (id !== ServiceID.REGISTRY) {
            throw new NotFoundError();
        }

        const actor = buildActorContext(req);
        await this.registryService.executeCommand(data.command, data, actor);

        return sendAccepted(res);
    }
}
