/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImageGroup } from '@privateaim/core-kit';

import {
    DController, DDelete, DGet, DPath, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    deleteMasterImageGroupRouteHandler,
    getManyMasterImageGroupRouteHandler,
    getOneMasterImageGroupRouteHandler,
} from './handlers/index.ts';

type PartialMasterImageGroup = Partial<MasterImageGroup>;

@DTags('master-image')
@DController('/master-image-groups')
export class MasterImageGroupController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialMasterImageGroup[]> {
        return await getManyMasterImageGroupRouteHandler(req, res) as PartialMasterImageGroup[];
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialMasterImageGroup | undefined> {
        return await getOneMasterImageGroupRouteHandler(req, res) as PartialMasterImageGroup | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialMasterImageGroup | undefined> {
        return await deleteMasterImageGroupRouteHandler(req, res) as PartialMasterImageGroup | undefined;
    }
}
