/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNode } from '@privateaim/core-kit';
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
import type { IAnalysisNodeService } from '../../../../../core/index.ts';
import { buildActorContext } from '../../../request/index.ts';

type PartialAnalysisNode = Partial<AnalysisNode>;

type AnalysisNodeControllerContext = {
    service: IAnalysisNodeService;
};

@DTags('analysis-node')
@DController('/analysis-nodes')
export class AnalysisNodeController {
    protected service: IAnalysisNodeService;

    constructor(ctx: AnalysisNodeControllerContext) {
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

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: any,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ): Promise<PartialAnalysisNode | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.create(data, actor);
        res.statusCode = 201;
        return entity;
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
    ): Promise<PartialAnalysisNode | undefined> {
        return this.service.getOne(id);
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
        @DBody() data: any,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ): Promise<PartialAnalysisNode | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.update(id, data, actor);
        res.statusCode = 202;
        return entity;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ): Promise<PartialAnalysisNode | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.delete(id, actor);
        res.statusCode = 202;
        return entity;
    }
}
