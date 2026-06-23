/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    MessageAckRequest,
    MessagePullQuery,
    SendMessageRequest,
} from '@privateaim/messenger-kit';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    DBody,
    DContext,
    DController,
    DGet,
    DPost,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import type { IAppEvent } from 'routup';
import type { IMessageService } from '../../../../core/entities/index.ts';
import { buildActorContext } from '../../request/index.ts';

type MessageControllerContext = {
    service: IMessageService;
};

@DTags('messages')
@DController('/messages')
export class MessageController {
    protected service: IMessageService;

    constructor(ctx: MessageControllerContext) {
        this.service = ctx.service;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async send(
        @DBody() data: SendMessageRequest,
        @DContext() event: IAppEvent,
    ) {
        const actor = buildActorContext(event);
        const messages = await this.service.send(data, actor);
        event.response.status = 202;
        return { data: messages.map((message) => message.id) };
    }

    @DGet('', [ForceLoggedInMiddleware])
    async pull(
        @DContext() event: IAppEvent,
    ) {
        const actor = buildActorContext(event);
        const query = useRequestQuery(event);
        return this.service.pull(this.parsePullQuery(query), actor);
    }

    @DPost('/ack', [ForceLoggedInMiddleware])
    async ack(
        @DBody() data: MessageAckRequest,
        @DContext() event: IAppEvent,
    ) {
        const actor = buildActorContext(event);
        await this.service.ack(data, actor);
        event.response.status = 202;
        return { data: data.ids };
    }

    protected parsePullQuery(query: Record<string, any>): MessagePullQuery {
        const result: MessagePullQuery = {};

        if (typeof query.limit !== 'undefined') {
            const limit = Number(query.limit);
            if (!Number.isNaN(limit)) {
                result.limit = limit;
            }
        }

        if (typeof query.wait !== 'undefined') {
            const wait = Number(query.wait);
            if (!Number.isNaN(wait)) {
                result.wait = wait;
            }
        }

        return result;
    }
}
