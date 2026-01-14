/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Project,
} from '@privateaim/core-kit';

import {
    DBody, DController, DDelete, DGet, DPath, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    createProjectRouteHandler,
    deleteProjectRouteHandler,
    getManyProjectRouteHandler,
    getOneProjectRouteHandler,
    updateProjectRouteHandler,
} from './handlers/index.ts';

type PartialProject = Partial<Project>;

@DTags('projects')
@DController('/projects')
export class ProposalController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProject[]> {
        return await getManyProjectRouteHandler(req, res) as PartialProject[];
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProject | undefined> {
        return await getOneProjectRouteHandler(req, res) as PartialProject | undefined;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async update(
        @DPath('id') id: string,
            @DBody() data: Project,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProject | undefined> {
        return await updateProjectRouteHandler(req, res) as PartialProject | undefined;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: Project,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProject | undefined> {
        return await createProjectRouteHandler(req, res) as PartialProject | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProject | undefined> {
        return await deleteProjectRouteHandler(req, res) as PartialProject | undefined;
    }
}
