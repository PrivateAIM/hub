/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MessagePartyKind } from './constants';

export type MessageParty = {
    type: `${MessagePartyKind}`,
    /** the party's authup subject id */
    id: string
};

/**
 * Opaque message payload. The hub never interprets it; for analysis messaging it
 * is base64 end-to-end ciphertext (`base64( IV ‖ ciphertext ‖ tag )`).
 */
export type MessageData = Record<string, any> | string | null;

/**
 * Free-form, non-secret message metadata, stored verbatim and never acted on by
 * the hub (the hub stays analysis-agnostic). For analysis-scoped messaging,
 * `analysisId` carries the scope so the receiving node can demux to the right
 * analysis and apply its own policy.
 */
export type MessageMetadata = {
    analysisId?: string
} & Record<string, any>;

/**
 * A durable message as stored by the broker and returned on pull — the domain
 * model implemented by the persistence entity (`MessageEntity implements Message`).
 * Identity is flat (`sender_type`/`sender_id`, `recipient_type`/`recipient_id`)
 * to match the storage row. Ordering uses `created_at` (the universal entity
 * field); delivery is delete-on-ack, so `id` is the ack key and the recipient's
 * dedup key across at-least-once redelivery.
 */
export interface Message {
    id: string;

    sender_type: `${MessagePartyKind}`;

    sender_id: string;

    recipient_type: `${MessagePartyKind}`;

    recipient_id: string;

    /** opaque payload (base64 E2E ciphertext for analysis messaging) */
    data: MessageData;

    metadata: MessageMetadata | null;

    created_at: Date;
}

/**
 * Send request (`POST /messages`). The sender is the authenticated identity;
 * recipients may be any identity kind (`user` / `robot` / `client`). The hub
 * persists one row per recipient.
 *
 * For end-to-end-encrypted analysis messaging — where each recipient is
 * encrypted under a distinct key — the sender issues one request per recipient
 * (single-element `recipients`); a shared / unencrypted payload may target many
 * recipients in one request.
 */
export type SendMessageRequest = {
    recipients: MessageParty[],
    data?: MessageData,
    metadata?: MessageMetadata | null
};

/**
 * Long-poll pull response (hub → recipient). Node-level: the calling identity's
 * pending (un-acked) messages, oldest first. The recipient processes them and
 * acks their ids, which deletes them.
 */
export type MessagePullResponse = {
    messages: Message[]
};

/** Query params for the pull. */
export type MessagePullQuery = {
    /** maximum number of messages to return */
    limit?: number
};

/** Ack request — deletes the named messages for the caller (delete-on-ack). */
export type MessageAckRequest = {
    ids: string[]
};
