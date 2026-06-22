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

/** A durable message as stored by the broker and returned on pull. */
export type StoredMessage = {
    id: string,
    sender: MessageParty,
    recipient: MessageParty,
    /**
     * Monotonic per-recipient ordering cursor. Serialized as a string to stay
     * safe for bigint-sized values across JSON.
     */
    sequence: string,
    data?: MessageData,
    metadata?: MessageMetadata | null,
    created_at: string,
    expires_at?: string | null
};

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
 * Long-poll pull response (hub → recipient). Node-level: returns every pending
 * message addressed to the calling identity. `cursor` is the value to ack and to
 * pass as `after` on the next pull.
 */
export type MessagePullResponse = {
    messages: StoredMessage[],
    cursor: string
};

/** Query params for the long-poll pull. */
export type MessagePullQuery = {
    /** return messages with a sequence strictly greater than this cursor */
    after?: string,
    /** long-poll wait budget in milliseconds before returning empty */
    wait?: number
};

/** Ack request — deletes everything up to and including `cursor` for the caller. */
export type MessageAckRequest = {
    cursor: string
};
