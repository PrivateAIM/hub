/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { NodeComponent } from '@privateaim/core-kit';
import type { EntityCollectionResponse } from '@privateaim/core-http-kit';
import {
    DContext,
    DController,
    DGet,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import type { IAppEvent } from 'routup';
import { ForceLoggedInMiddleware, buildActorContext } from '@privateaim/server-http-kit';
import { describeQuerySchema } from '@privateaim/server-kit';
import type { INodeComponentService } from '../../../../../core/index.ts';
import { nodeComponentSchema } from '../../../../../core/index.ts';

type NodeComponentControllerContext = {
    service: INodeComponentService;
};

@DTags('node')
@DController('/node-components')
export class NodeComponentController {
    protected service: INodeComponentService;

    constructor(ctx: NodeComponentControllerContext) {
        this.service = ctx.service;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DContext() event: IAppEvent,
    ): Promise<EntityCollectionResponse<NodeComponent>> {
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query, buildActorContext(event));

        return { data, meta: { ...meta, schema: describeQuerySchema(nodeComponentSchema) } };
    }
}
