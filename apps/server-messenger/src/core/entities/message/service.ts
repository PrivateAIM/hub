/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@privateaim/errors';
import type {
    Message,
    MessageAckRequest,
    MessageParty,
    MessagePullQuery,
    MessagePullResponse,
    SendMessageRequest,
} from '@privateaim/messenger-kit';
import { MessagePartyKind } from '@privateaim/messenger-kit';
import type { ActorContext } from '@privateaim/server-kit';
import type { IMessageRepository, IMessageService, MessagePersistInput } from './types.ts';

const DEFAULT_PULL_LIMIT = 50;
const MAX_PULL_LIMIT = 100;

/** Uniform message time-to-live (24h). */
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PARTY_KINDS = new Set<string>(Object.values(MessagePartyKind));

export class MessageService implements IMessageService {
    protected repository: IMessageRepository;

    protected ttlMs: number;

    constructor(ctx: { repository: IMessageRepository, ttlMs?: number }) {
        this.repository = ctx.repository;
        this.ttlMs = ctx.ttlMs ?? DEFAULT_TTL_MS;
    }

    async send(data: SendMessageRequest, actor: ActorContext): Promise<Message[]> {
        const sender = this.requireIdentity(actor);
        const recipients = this.validateRecipients(data);

        const expiresAt = `${Date.now() + this.ttlMs}`;

        const input: MessagePersistInput[] = recipients.map((recipient) => ({
            sender_type: sender.type,
            sender_id: sender.id,
            recipient_type: recipient.type,
            recipient_id: recipient.id,
            data: data.data ?? null,
            metadata: data.metadata ?? null,
            expires_at: expiresAt,
        }));

        return this.repository.createMany(input);
    }

    async pull(query: MessagePullQuery, actor: ActorContext): Promise<MessagePullResponse> {
        const recipient = this.requireIdentity(actor);

        const limit = this.resolveLimit(query.limit);
        const messages = await this.repository.findManyForRecipient(recipient, limit);

        return { messages };
    }

    async ack(data: MessageAckRequest, actor: ActorContext): Promise<void> {
        const recipient = this.requireIdentity(actor);

        if (!data || !Array.isArray(data.ids) || data.ids.length === 0) {
            throw new BadRequestError('At least one message id is required to acknowledge.');
        }

        await this.repository.ackByIds(recipient, data.ids);
    }

    protected resolveLimit(limit: number | undefined): number {
        if (typeof limit !== 'number' || !Number.isFinite(limit)) {
            return DEFAULT_PULL_LIMIT;
        }

        const normalized = Math.floor(limit);
        if (normalized <= 0) {
            return DEFAULT_PULL_LIMIT;
        }

        return Math.min(normalized, MAX_PULL_LIMIT);
    }

    protected requireIdentity(actor: ActorContext): MessageParty {
        if (!actor.identity) {
            throw new BadRequestError('The request is not associated with an authenticated identity.');
        }

        return { type: actor.identity.type, id: actor.identity.id };
    }

    protected validateRecipients(data: SendMessageRequest): MessageParty[] {
        if (!data || !Array.isArray(data.recipients) || data.recipients.length === 0) {
            throw new BadRequestError('At least one recipient is required.');
        }

        return data.recipients.map((recipient) => {
            if (!recipient || typeof recipient.id !== 'string' || typeof recipient.type !== 'string') {
                throw new BadRequestError('Each recipient must define a type and an id.');
            }

            if (!UUID_PATTERN.test(recipient.id)) {
                throw new BadRequestError('Each recipient id must be a uuid.');
            }

            if (!PARTY_KINDS.has(recipient.type)) {
                throw new BadRequestError('Each recipient type must be one of user, robot or client.');
            }

            return { type: recipient.type, id: recipient.id };
        });
    }
}
