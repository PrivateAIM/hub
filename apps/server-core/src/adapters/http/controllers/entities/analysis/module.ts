/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis, AnalysisCommand } from '@privateaim/core-kit';
import {
    DBody,
    DController,
    DDelete,
    DGet,
    DPath,
    DPost,
    DRequest,
    DResponse,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import type { Request, Response } from 'routup';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { IAnalysisService } from '../../../../../core/index.ts';
import { buildActorContext } from '../../../request/index.ts';

type PartialAnalysis = Partial<Analysis>;

type AnalysisControllerContext = {
    service: IAnalysisService;
};

@DTags('analysis')
@DController('/analyses')
export class AnalysisController {
    protected service: IAnalysisService;

    constructor(ctx: AnalysisControllerContext) {
        this.service = ctx.service;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: Request,
    ) {
        const query = useRequestQuery(req);
        const { data, meta } = await this.service.getMany(query);
        return { data, meta };
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
    ): Promise<PartialAnalysis | undefined> {
        return this.service.getOne(id);
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: any,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ): Promise<PartialAnalysis | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.create(data, actor);
        res.statusCode = 201;
        return entity;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
        @DBody() data: any,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ): Promise<PartialAnalysis | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.update(id, data, actor);
        res.statusCode = 202;
        return entity;
    }

    @DPost('/:id/command', [ForceLoggedInMiddleware])
    async doTask(
        @DPath('id') id: string,
        @DBody() data: { command: AnalysisCommand },
        @DRequest() req: Request,
        @DResponse() res: Response,
    ): Promise<PartialAnalysis | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.executeCommand(id, data.command, actor);
        res.statusCode = 202;
        return entity;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ): Promise<PartialAnalysis | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.delete(id, actor);
        res.statusCode = 202;
        return entity;
    }
}
