/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Analysis,
    AnalysisAPICommand,
} from '@privateaim/core';
import {
    DBody, DController, DDelete, DGet, DPath, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';
import {
    createAnalysisRouteHandler,
    deleteAnalysisRouteHandler,
    getManyAnalysisRouteHandler,
    getOneAnalysisRouteHandler,
    handleAnalysisCommandRouteHandler,
    handleAnalysisFilesDownloadRouteHandler,
    handleAnalysisResultDownloadRouteHandler,
    updateAnalysisRouteHandler,
} from './handlers';
import { ForceLoggedInMiddleware } from '../../../middleware';

type PartialAnalysis = Partial<Analysis>;

@DTags('analysis')
@DController('/analyses')
export class AnalysisController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysis[]> {
        return getManyAnalysisRouteHandler(req, res);
    }

    @DGet('/:id/files/download', [ForceLoggedInMiddleware])
    async getFiles(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<any> {
        return handleAnalysisFilesDownloadRouteHandler(req, res);
    }

    @DGet('/:id/result/download', [ForceLoggedInMiddleware])
    async getResult(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<any> {
        return handleAnalysisResultDownloadRouteHandler(req, res);
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysis | undefined> {
        return getOneAnalysisRouteHandler(req, res);
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
            @DBody() data: PartialAnalysis,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysis | undefined> {
        return updateAnalysisRouteHandler(req, res);
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: PartialAnalysis,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysis | undefined> {
        return createAnalysisRouteHandler(req, res);
    }

    @DPost('/:id/command', [ForceLoggedInMiddleware])
    async doTask(
        @DPath('id') id: string,
            @DBody() data: {
                command: AnalysisAPICommand
            },
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysis | undefined> {
        return handleAnalysisCommandRouteHandler(req, res);
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysis | undefined> {
        return deleteAnalysisRouteHandler(req, res);
    }

    // --------------------------------------------------------------------------
}
