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
    AnalysisClientCredentialService,
    AnalysisClientCredentials,
} from '../../../../../app/modules/database/analysis-client-credential.ts';
import { buildActorContext } from '../../../request/index.ts';

type AnalysisClientCredentialControllerContext = {
    service: AnalysisClientCredentialService;
};

@DTags('analysis')
@DController('/analyses')
export class AnalysisClientCredentialController {
    protected service: AnalysisClientCredentialService;

    constructor(ctx: AnalysisClientCredentialControllerContext) {
        this.service = ctx.service;
    }

    @DGet('/:id/client/credentials', [ForceLoggedInMiddleware])
    async getCredentials(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<AnalysisClientCredentials> {
        const actor = buildActorContext(event);
        return this.service.getCredentials(id, actor);
    }
}
