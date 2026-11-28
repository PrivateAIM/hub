/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    NodeComponent,
    NodeComponentReport,
    NodeComponentsReport,
} from '@privateaim/core-kit';
import type { EntityCollectionResponse, EntityRecordResponse } from '@privateaim/core-http-kit';
import {
    DBody,
    DConsumes,
    DContext,
    DController,
    DPath,
    DPut,
    DTags,
} from '@routup/decorators';
import type { IAppEvent } from 'routup';
import { ForceLoggedInMiddleware, buildActorContext } from '@privateaim/server-http-kit';
import type { INodeStatusService } from '../../../../../core/services/node-status/index.ts';

type NodeStatusControllerContext = {
    service: INodeStatusService;
};

/**
 * Status reports of a node, written by the node's own client.
 */
@DTags('node')
@DController('/nodes')
export class NodeStatusController {
    protected service: INodeStatusService;

    constructor(ctx: NodeStatusControllerContext) {
        this.service = ctx.service;
    }

    @DPut('/:id/status', [ForceLoggedInMiddleware])
    @DConsumes('application/json')
    async report(
        @DPath('id') id: string,
        @DBody() data: NodeComponentsReport,
        @DContext() event: IAppEvent,
    ): Promise<EntityCollectionResponse<NodeComponent>> {
        const entities = await this.service.reportStatus(id, data, buildActorContext(event));

        return { data: entities, meta: { total: entities.length } };
    }

    @DPut('/:id/components/:name/status', [ForceLoggedInMiddleware])
    @DConsumes('application/json')
    async reportComponent(
        @DPath('id') id: string,
        @DPath('name') name: string,
        @DBody() data: Omit<NodeComponentReport, 'name'>,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<NodeComponent>> {
        const entity = await this.service.reportComponentStatus(id, name, data, buildActorContext(event));

        return { data: entity, meta: {} };
    }
}
