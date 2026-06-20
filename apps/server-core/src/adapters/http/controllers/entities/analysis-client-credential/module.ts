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
    IAnalysisClientCredentialService,
} from '../../../../../core/services/client-credential/index.ts';
import { buildActorContext } from '../../../request/index.ts';

type AnalysisClientCredentialControllerContext = {
    service: IAnalysisClientCredentialService;
};

@DTags('analysis')
@DController('/analyses')
export class AnalysisClientCredentialController {
    protected service: IAnalysisClientCredentialService;

    constructor(ctx: AnalysisClientCredentialControllerContext) {
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
        @DBody() data: { secret?: string },
        @DContext() event: IAppEvent,
    ): Promise<ClientCredentials> {
        const actor = buildActorContext(event);
        return this.service.setCredentials(id, data?.secret, actor);
    }
}
