/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DContext,
    DController,
    DGet,
    DPath,
    DTags,
} from '@routup/decorators';
import type { IAppEvent } from 'routup';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type {
    ClientCredentials,
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
}
