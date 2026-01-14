/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    RegistryProject,
} from '@privateaim/core-kit';

import {
    DBody, DController, DDelete, DGet, DPath, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    createRegistryProjectRouteHandler,
    deleteRegistryProjectRouteHandler,
    getManyRegistryProjectRouteHandler,
    getOneRegistryProjectRouteHandler,
    updateRegistryProjectRouteHandler,
} from './handlers/index.ts';

type PartialRegistryProject = Partial<RegistryProject>;

@DTags('registry')
@DController('/registry-projects')
export class RegistryProjectController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialRegistryProject[]> {
        return await getManyRegistryProjectRouteHandler(req, res) as PartialRegistryProject[];
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialRegistryProject | undefined> {
        return await getOneRegistryProjectRouteHandler(req, res) as PartialRegistryProject | undefined;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async update(
        @DPath('id') id: string,
            @DBody() data: RegistryProject,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialRegistryProject | undefined> {
        return await updateRegistryProjectRouteHandler(req, res) as PartialRegistryProject | undefined;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: RegistryProject,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialRegistryProject | undefined> {
        return await createRegistryProjectRouteHandler(req, res) as PartialRegistryProject | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialRegistryProject | undefined> {
        return await deleteRegistryProjectRouteHandler(req, res) as PartialRegistryProject | undefined;
    }
}
