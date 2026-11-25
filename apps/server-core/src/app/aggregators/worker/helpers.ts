/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from '@privateaim/kit';

/** Upper bound for an error message copied into a telemetry event's `data`. */
export const EVENT_ERROR_MESSAGE_MAX_LENGTH = 512;

/**
 * The message of the `error` a worker attached to a `*_FAILED` event payload,
 * cut to {@link EVENT_ERROR_MESSAGE_MAX_LENGTH}.
 *
 * Over AMQP the error arrives as hubwire's `{ name, message, code }` plain
 * object, not an `Error` instance; on the memory bus it is the original
 * `Error`. Both carry a string `message`.
 */
export function extractPayloadErrorMessage(payload: unknown): string | undefined {
    if (!isObject(payload) || !isObject(payload.error)) {
        return undefined;
    }

    const { message } = payload.error;

    if (typeof message !== 'string' || message.length === 0) {
        return undefined;
    }

    return message.slice(0, EVENT_ERROR_MESSAGE_MAX_LENGTH);
}
