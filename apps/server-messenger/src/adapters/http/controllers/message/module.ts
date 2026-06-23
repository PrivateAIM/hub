/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@privateaim/errors';
import type {
    MessageAckRequest,
    MessageParty,
    MessagePullQuery,
    SendMessageRequest,
} from '@privateaim/messenger-kit';
import { WakeupEventName } from '@privateaim/messenger-kit';
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
import { createEventStream } from 'routup';
import type { IMessageService } from '../../../../core/entities/index.ts';
import type { IMessageWakeup } from '../../../../core/services/wakeup/index.ts';
import { buildActorContext } from '../../request/index.ts';

type MessageControllerContext = {
    service: IMessageService;
    wakeup: IMessageWakeup;
};

/** How often the SSE stream emits a keep-alive (also probes for client disconnect). */
const SSE_HEARTBEAT_MS = 15 * 1000;

@DTags('messages')
@DController('/messages')
export class MessageController {
    protected service: IMessageService;

    protected wakeup: IMessageWakeup;

    constructor(ctx: MessageControllerContext) {
        this.service = ctx.service;
        this.wakeup = ctx.wakeup;
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

    /**
     * Server-Sent Events stream of payload-free `messagePending` wakeups for the
     * calling identity. On each wakeup (and once on connect, to catch up) the
     * client should pull via `GET /messages`. The payload never crosses the stream.
     */
    @DGet('/stream', [ForceLoggedInMiddleware])
    async stream(@DContext() event: IAppEvent) {
        const actor = buildActorContext(event);
        if (!actor.identity) {
            throw new BadRequestError('The request is not associated with an authenticated identity.');
        }

        const recipient: MessageParty = { type: actor.identity.type, id: actor.identity.id };
        const stream = createEventStream(event);

        const push = () => stream.write({
            event: WakeupEventName.MESSAGE_PENDING,
            data: JSON.stringify({ recipient }),
        });

        // nudge the client to pull on connect (catch up on anything pending before the stream opened)
        push();

        const unsubscribe = this.wakeup.subscribe(recipient, push);

        const heartbeat = setInterval(() => {
            // `write` returns false once the client disconnects — use it to drive cleanup
            const alive = stream.write({ event: 'ping', data: `${Date.now()}` });
            if (!alive) {
                clearInterval(heartbeat);
                unsubscribe();
                stream.end();
            }
        }, SSE_HEARTBEAT_MS);

        if (typeof heartbeat.unref === 'function') {
            heartbeat.unref();
        }

        return stream.response;
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
