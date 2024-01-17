/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    ProjectNode,
} from '@personalhealthtrain/core';
import {
    DBody, DController, DDelete, DGet, DPath, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';

import { ForceLoggedInMiddleware } from '../../../middleware';
import {
    createProposalStationRouteHandler,
    deleteProposalStationRouteHandler,
    getManyProposalStationRouteHandler,
    getOneProposalStationRouteHandler,
    updateProposalStationRouteHandler,
} from './handlers';

type PartialProposalStation = Partial<ProjectNode>;

@DTags('proposal', 'station')
@DController('/proposal-stations')
export class ProposalStationController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProposalStation[]> {
        return getManyProposalStationRouteHandler(req, res);
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: Pick<ProjectNode, 'node_id' | 'project_id'>,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProposalStation | undefined> {
        return createProposalStationRouteHandler(req, res);
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProposalStation | undefined> {
        return getOneProposalStationRouteHandler(req, res);
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
            @DBody() data: Pick<ProjectNode, 'comment' | 'approval_status'>,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProposalStation | undefined> {
        return updateProposalStationRouteHandler(req, res);
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialProposalStation | undefined> {
        return deleteProposalStationRouteHandler(req, res);
    }
}
