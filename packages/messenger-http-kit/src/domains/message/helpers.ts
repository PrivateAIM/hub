/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MessagePendingEvent } from '@privateaim/messenger-kit';
import { MessagePartyKind, WakeupEventName } from '@privateaim/messenger-kit';
import type { EventStreamMessage } from 'hapic';
import type { MessageStreamEvent } from './types';

const PARTY_KINDS : string[] = Object.values(MessagePartyKind);

function isRecord(input: unknown) : input is Record<string, unknown> {
    return typeof input === 'object' && input !== null && !Array.isArray(input);
}

export function isMessagePendingEvent(input: unknown) : input is MessagePendingEvent {
    if (!isRecord(input) || !isRecord(input.recipient)) {
        return false;
    }

    return typeof input.recipient.type === 'string' &&
        PARTY_KINDS.includes(input.recipient.type) &&
        typeof input.recipient.id === 'string';
}

function parseJSON(input: string) : unknown {
    try {
        return JSON.parse(input);
    } catch {
        return undefined;
    }
}

/**
 * Turn a parsed server-sent event into a typed wakeup. Returns `undefined`
 * for anything else: keep-alive pings, event types this client does not know,
 * and a known type whose data does not match its payload.
 */
export function toMessageStreamEvent(message: EventStreamMessage) : MessageStreamEvent | undefined {
    if (message.type !== WakeupEventName.MESSAGE_PENDING) {
        return undefined;
    }

    const data = parseJSON(message.data);

    if (!isMessagePendingEvent(data)) {
        return undefined;
    }

    return {
        type: WakeupEventName.MESSAGE_PENDING,
        data,
        lastEventId: message.lastEventId,
        ...(typeof message.retry === 'number' ? { retry: message.retry } : {}),
    };
}
