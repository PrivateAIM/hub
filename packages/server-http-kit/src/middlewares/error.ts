/*
 * Copyright (c) 2021-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from '@privateaim/kit';
import type { HubError } from '@privateaim/errors';
import { httpStatusFromCode } from '@privateaim/errors';
import type { Logger } from '@privateaim/server-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import type { Router } from 'routup';
import { defineErrorHandler } from 'routup';
import type { Issue } from 'validup';
import { sanitizeError } from '../core';

type ErrorResponsePayload = {
    statusCode: number,
    code: string,
    message: string,
    issues: Issue[],
    [key: string]: any
};

type ErrorMiddlewareOptions = {
    logger?: Logger,
};

export function mountErrorMiddleware(router: Router, options: ErrorMiddlewareOptions = {}) {
    router.use(defineErrorHandler((error, event) => {
        let next: HubError;
        if (error.cause) {
            next = sanitizeError(error.cause);
        } else {
            next = sanitizeError(error);
        }

        const status = httpStatusFromCode(next.code);

        const payload: ErrorResponsePayload = {
            statusCode: status,
            code: `${next.code}`,
            message: next.message,
            issues: next.issues,
        };

        const isServerError = status >= 500 && status < 600;
        if (isServerError && options.logger) {
            if (error.cause && isObject(error.cause)) {
                options.logger.error({
                    message: error.cause as Error,
                    [LogFlag.CHANNEL]: LogChannel.HTTP,
                });
            } else {
                options.logger.error({
                    message: error,
                    [LogFlag.CHANNEL]: LogChannel.HTTP,
                });
            }
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
