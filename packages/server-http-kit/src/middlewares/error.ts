/*
 * Copyright (c) 2021-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Issue } from '@ebec/core';
import { isObject } from '@privateaim/kit';
import type { HubError } from '@privateaim/errors';
import { httpStatusFromCode } from '@privateaim/errors';
import type { Logger } from '@privateaim/server-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import type { App } from 'routup';
import { defineErrorHandler } from 'routup';
import { sanitizeError } from '../core';
import { setRequestEnv } from '../request';

type ErrorResponsePayload = {
    statusCode: number,
    code: string,
    message: string,
    issues: ReadonlyArray<Issue>,
    [key: string]: any
};

type ErrorMiddlewareOptions = {
    logger?: Logger,
};

export function mountErrorMiddleware(app: App, options: ErrorMiddlewareOptions = {}) {
    app.use(defineErrorHandler((error, event) => {
        // routup wraps a thrown error as the cause of its AppError; an error
        // routup or a plugin raised itself (invalid JSON 400, body limit 413,
        // content type 415, handler timeout 408) has no error cause and
        // keeps its own status.
        const source = Error.isError(error.cause) ? error.cause : error;
        const next: HubError = sanitizeError(source);

        const status = next.status ?? httpStatusFromCode(next.code);

        setRequestEnv(event, 'errorCode', `${next.code}`);

        const payload: ErrorResponsePayload = {
            statusCode: status,
            code: `${next.code}`,
            message: next.message,
            issues: next.issues,
        };

        const isServerError = status >= 500 && status < 600;

        // A request the caller abandoned fails with its abort reason; nobody
        // reads the answer, and it is not a server fault worth logging.
        if (isServerError && options.logger && !event.signal.aborted) {
            options.logger.error({
                message: source,
                [LogFlag.CHANNEL]: LogChannel.HTTP,
                method: event.method,
                // The route pattern (`/analyses/:id`), never the concrete path.
                ...(event.route ? { route: event.route.path } : {}),
            });
        } else if (isObject(next.data)) {
            const keys = Object.keys(next.data);

            for (const key of keys) {
                payload[key] = next.data[key];
            }
        }

        event.response.status = status;

        return payload;
    }));
}
