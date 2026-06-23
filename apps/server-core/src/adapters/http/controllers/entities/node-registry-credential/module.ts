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
    INodeRegistryCredentialService,
    RegistryCredentials,
} from '../../../../../core/services/registry-credential/index.ts';
import { buildActorContext } from '../../../request/index.ts';

type NodeRegistryCredentialControllerContext = {
    service: INodeRegistryCredentialService;
};

@DTags('node')
@DController('/nodes')
export class NodeRegistryCredentialController {
    protected service: INodeRegistryCredentialService;

    constructor(ctx: NodeRegistryCredentialControllerContext) {
        this.service = ctx.service;
    }

    @DGet('/:id/registry/credentials', [ForceLoggedInMiddleware])
    async getCredentials(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<RegistryCredentials> {
        const actor = buildActorContext(event);
        return this.service.getCredentials(id, actor);
    }
}
