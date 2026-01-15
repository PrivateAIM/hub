/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    ProjectNode,
} from '@privateaim/core-kit';
import {
    DBody, DController, DDelete, DGet, DPath, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';

import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    createProjectNodeRouteHandler,
    deleteProjectNodeRouteHandler,
    getManyProjectNodeRouteHandler,
    getOneProjectNodeRouteHandler,
    updateProjectNodeRouteHandler,
} from './handlers/index.ts';

type PartialProjectNode = Partial<ProjectNode>;

@DTags('proposal', 'station')
@DController('/project-nodes')
export class ProposalStationController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProjectNode[]> {
        return getManyProjectNodeRouteHandler(req, res);
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: Pick<ProjectNode, 'node_id' | 'project_id'>,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProjectNode | undefined> {
        return createProjectNodeRouteHandler(req, res);
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProjectNode | undefined> {
        return getOneProjectNodeRouteHandler(req, res);
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
            @DBody() data: Pick<ProjectNode, 'comment' | 'approval_status'>,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProjectNode | undefined> {
        return updateProjectNodeRouteHandler(req, res);
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProjectNode | undefined> {
        return deleteProjectNodeRouteHandler(req, res);
    }
}
