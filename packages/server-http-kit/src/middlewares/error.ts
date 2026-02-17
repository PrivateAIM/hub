/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { HubError } from '@privateaim/kit';
import { isObject } from '@privateaim/kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import type { Router } from 'routup';
import { errorHandler, send } from 'routup';
import { useLogger } from '@privateaim/server-kit';
import type { Issue } from 'validup';
import { sanitizeError } from '../core';

type ErrorResponsePayload = {
    statusCode: number,
    code: string,
    message: string,
    issues: Issue[],
    [key: string]: any
};

export function mountErrorMiddleware(router: Router) {
    router.use(errorHandler((error, req, res) => {
        let next : HubError;
        if (error.cause) {
            next = sanitizeError(error.cause);
        } else {
            next = sanitizeError(error);
        }

        const payload : ErrorResponsePayload = {
            statusCode: next.statusCode,
            code: `${next.code}`,
            message: next.message,
            issues: next.issues,
        };

        const isServerError = next.statusCode >= 500 && next.statusCode < 600;
        if (isServerError) {
            if (error.cause && isObject(error.cause)) {
                useLogger().error({
                    message: error.cause as Error,
                    [LogFlag.CHANNEL]: LogChannel.HTTP,
                });
            } else {
                useLogger().error({
                    message: error,
                    [LogFlag.CHANNEL]: LogChannel.HTTP,
                });
            }
        } else if (isObject(next.data)) {
            const keys = Object.keys(next.data);
            for (let i = 0; i < keys.length; i++) {
                payload[keys[i]] = next.data[keys[i]];
            }
        }

        res.statusCode = payload.statusCode;
        return send(res, payload);
    }));
}
