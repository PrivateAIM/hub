/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DBody,
    DContext,
    DController,
    DGet,
    DPath,
    DPost,
    DTags,
} from '@routup/decorators';
import type { IAppEvent } from 'routup';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type {
    ClientCredentials,
    ClientCredentialsUpdate,
    INodeClientCredentialService,
} from '../../../../../core/services/client-credential/index.ts';
import { buildActorContext } from '../../../request/index.ts';

type NodeClientCredentialControllerContext = {
    service: INodeClientCredentialService;
};

@DTags('node')
@DController('/nodes')
export class NodeClientCredentialController {
    protected service: INodeClientCredentialService;

    constructor(ctx: NodeClientCredentialControllerContext) {
        this.service = ctx.service;
    }

    @DGet('/:id/client/credentials', [ForceLoggedInMiddleware])
    async getCredentials(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<ClientCredentials> {
        const actor = buildActorContext(event);
        return this.service.getCredentials(id, actor);
    }

    @DPost('/:id/client/credentials', [ForceLoggedInMiddleware])
    async setCredentials(
        @DPath('id') id: string,
        @DBody() data: ClientCredentialsUpdate,
        @DContext() event: IAppEvent,
    ): Promise<ClientCredentials> {
        const actor = buildActorContext(event);
        return this.service.setCredentials(id, data ?? {}, actor);
    }
}
