/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MessageParty } from '../message';
import type { WakeupEventName } from './constants';

/**
 * Payload-free wake signal emitted to a recipient when a message is persisted.
 * It carries only the target identity — never the payload — so the recipient
 * pulls the actual message(s) via REST. A recipient that is not connected for
 * the wakeup falls back to the long-poll pull.
 */
export type MessagePendingEvent = {
    recipient: MessageParty
};

export type MessagePendingEvents = {
    [WakeupEventName.MESSAGE_PENDING]: (data: MessagePendingEvent) => void
};
