/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis, AnalysisCommand as AnalysisCommandType } from '@privateaim/core-kit';
import { AnalysisCommand } from '@privateaim/core-kit';
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
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceWritable } from '@privateaim/kit';
import { 
    send, 
    sendAccepted, 
    sendCreated, 
    useRequestParam, 
} from 'routup';
import { ForceLoggedInMiddleware, HTTPHandlerOperation, useRequestIdentityRealm } from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import type { IAnalysisService } from '../../../../../core/index.ts';
import type { AnalysisBuilder } from '../../../../../core/services/analysis-builder/index.ts';
import type { AnalysisConfigurator } from '../../../../../core/services/analysis-configurator/index.ts';
import type { AnalysisDistributor } from '../../../../../core/services/analysis-distributor/index.ts';
import type { AnalysisStorageManager } from '../../../../../core/services/analysis-storage-manager/index.ts';
import { buildActorContext } from '../../../request/index.ts';
import { AnalysisCommandValidator } from './utils/index.ts';

type PartialAnalysis = Partial<Analysis>;

type AnalysisControllerContext = {
    service: IAnalysisService;
    builder: AnalysisBuilder;
    configurator: AnalysisConfigurator;
    distributor: AnalysisDistributor;
    storageManager: AnalysisStorageManager;
    skipAnalysisApproval?: boolean;
};

@DTags('analysis')
@DController('/analyses')
export class AnalysisController {
    protected service: IAnalysisService;

    protected builder: AnalysisBuilder;

    protected configurator: AnalysisConfigurator;

    protected distributor: AnalysisDistributor;

    protected storageManager: AnalysisStorageManager;

    protected skipAnalysisApproval: boolean;

    constructor(ctx: AnalysisControllerContext) {
        this.service = ctx.service;
        this.builder = ctx.builder;
        this.configurator = ctx.configurator;
        this.distributor = ctx.distributor;
        this.storageManager = ctx.storageManager;
        this.skipAnalysisApproval = ctx.skipAnalysisApproval ?? false;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialAnalysis[]> {
        const query = useRequestQuery(req);
        const { data, meta } = await this.service.getMany(query);
        return send(res, { data, meta }) as any;
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialAnalysis | undefined> {
        const entity = await this.service.getOne(id);
        return send(res, entity) as PartialAnalysis | undefined;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: any,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialAnalysis | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.create(data, actor);
        return sendCreated(res, entity) as PartialAnalysis | undefined;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
        @DBody() data: any,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialAnalysis | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.update(id, data, actor);
        return sendAccepted(res, entity) as PartialAnalysis | undefined;
    }

    @DPost('/:id/command', [ForceLoggedInMiddleware])
    async doTask(
        @DPath('id') id: string,
        @DBody() _cmdData: { command: AnalysisCommandType },
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialAnalysis | undefined> {
        const reqId = useRequestParam(req, 'id');
        if (typeof reqId !== 'string' || reqId.length === 0) {
            throw new NotFoundError();
        }

        const validator = new AnalysisCommandValidator();
        const validatorAdapter = new RoutupContainerAdapter(validator);
        const data = await validatorAdapter.run(req, { group: HTTPHandlerOperation.CREATE });

        let entity = await this.service.getOne(reqId);

        if (!isRealmResourceWritable(useRequestIdentityRealm(req), entity.realm_id)) {
            throw new ForbiddenError();
        }

        const actor = buildActorContext(req);
        const persistCtx = { data: actor.metadata };

        switch (data.command) {
            case AnalysisCommand.BUILD_CHECK:
                entity = await this.builder.check(entity);
                break;
            case AnalysisCommand.BUILD_START:
                entity = await this.builder.start(entity, persistCtx);
                break;
            case AnalysisCommand.CONFIGURATION_LOCK:
                entity = await this.configurator.lock(entity, {
                    ignoreApproval: this.skipAnalysisApproval,
                    persistCtx,
                });
                break;
            case AnalysisCommand.CONFIGURATION_UNLOCK:
                entity = await this.configurator.unlock(entity, {
                    ignoreApproval: this.skipAnalysisApproval,
                    persistCtx,
                });
                break;
            case AnalysisCommand.DISTRIBUTION_CHECK:
                entity = await this.distributor.check(entity);
                break;
            case AnalysisCommand.DISTRIBUTION_START:
                entity = await this.distributor.start(entity, persistCtx);
                break;
            case AnalysisCommand.STORAGE_CHECK:
                entity = await this.storageManager.check(entity);
                break;
        }

        return sendAccepted(res, entity) as PartialAnalysis | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialAnalysis | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.delete(id, actor);
        return sendAccepted(res, entity) as PartialAnalysis | undefined;
    }
}
