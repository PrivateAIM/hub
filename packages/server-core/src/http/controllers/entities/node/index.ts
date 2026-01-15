/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Node,
} from '@privateaim/core-kit';
import {
    DBody, DController, DDelete, DGet, DPath, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';

import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    createNodeRouteHandler,
    deleteNodeRouteHandler,
    getManyNodeRouteHandler,
    getOneNodeRouteHandler,
    updateNodeRouteHandler,
} from './handlers/index.ts';

type PartialNode = Partial<Node>;

@DTags('node')
@DController('/nodes')
export class NodeController {
    @DGet('', [ForceLoggedInMiddleware])

    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialNode[]> {
        return await getManyNodeRouteHandler(req, res) as PartialNode[];
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: PartialNode,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialNode | undefined> {
        return await createNodeRouteHandler(req, res) as PartialNode | undefined;
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialNode | undefined> {
        return await getOneNodeRouteHandler(req, res) as PartialNode | undefined;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
            @DBody() data: PartialNode,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialNode | undefined> {
        return await updateNodeRouteHandler(req, res) as PartialNode | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialNode | undefined> {
        return await deleteNodeRouteHandler(req, res) as PartialNode | undefined;
    }
}
