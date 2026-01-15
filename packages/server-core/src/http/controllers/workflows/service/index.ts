/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RegistryAPICommand } from '@privateaim/core-kit';
import { ServiceID } from '@privateaim/core-kit';
import {
    DBody, DController, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';

import { NotFoundError } from '@ebec/http';
import { Request, Response, useRequestParam } from 'routup';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import { RegistryHook } from '../../../../components/index.ts';
import { postHarborHookRouteHandler } from './handlers/registry/hook.ts';
import { handleRegistryCommandRouteHandler } from './handlers/registry/command.ts';

@DTags('extra')
@DController('/services')
export class ServiceController {
    @DPost('/:id/hook', [ForceLoggedInMiddleware])
    async handleHarborHook(
    @DRequest() req: Request,
        @DResponse() res: Response,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @DBody() _harborHook: RegistryHook,
    ) {
        const id = useRequestParam(req, 'id');

        switch (id) {
            case ServiceID.REGISTRY:
                return postHarborHookRouteHandler(req, res);
        }

        throw new NotFoundError();
    }

    @DPost('/:id/command', [ForceLoggedInMiddleware])
    async execHarborTask(
    @DRequest() req: Request,
        @DResponse() res: Response,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @DBody() _data: { command: RegistryAPICommand },
    ) {
        const id = useRequestParam(req, 'id');

        switch (id) {
            case ServiceID.REGISTRY:
                return handleRegistryCommandRouteHandler(req, res);
        }

        throw new NotFoundError();
    }
}
