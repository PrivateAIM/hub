/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuiltInPolicyType, PermissionError } from '@authup/access';
import { HubError, isObject } from '@privateaim/kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import type { Router } from 'routup';
import { errorHandler } from 'routup';
import { useLogger } from '@privateaim/server-kit';
import { EntityRelationLookupError } from 'typeorm-extension';
import { ValidupNestedError, ValidupValidatorError } from 'validup';

export function mountErrorMiddleware(router: Router) {
    router.use(errorHandler((error, req, res) => {
        const isServerError = error.statusCode >= 500 &&
            error.statusCode < 600;

        if (isServerError || error.logMessage) {
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
        }

        if (error.cause instanceof HubError) {
            error.expose = true;
            error.statusCode = 400;
        }

        if (error.cause instanceof PermissionError) {
            error.expose = true;

            if (
                error.cause.policy &&
                error.cause.policy.type === BuiltInPolicyType.IDENTITY
            ) {
                error.statusCode = 401;
            } else {
                error.statusCode = 403;
            }
        }

        if (error.cause instanceof EntityRelationLookupError) {
            error.expose = true;
            error.statusCode = 400;
        }

        if (error.cause instanceof ValidupNestedError) {
            error.expose = true;
            error.statusCode = 400;
            error.data = {
                children: error.cause.children,
                attributes: error.cause.children.map((child) => child.pathAbsolute),
            };
        }

        if (error.cause instanceof ValidupValidatorError) {
            error.expose = true;
            error.statusCode = 400;
        }

        // catch and decorate some db errors :)
        switch (error.code) {
            case 'ER_DUP_ENTRY':
            case 'SQLITE_CONSTRAINT_UNIQUE': {
                error.statusCode = 409;
                error.message = 'An entry with some unique attributes already exist.';
                error.expose = true;
                break;
            }
            case 'ER_DISK_FULL':
                error.statusCode = 507;
                error.message = 'No database operation possible, due the leak of free disk space.';
                error.expose = true;
                break;
        }

        const exposeError = typeof error.expose === 'boolean' ?
            error.expose :
            !isServerError;

        if (!exposeError) {
            error.message = 'An internal server error occurred.';
        }

        res.statusCode = error.statusCode;

        return {
            statusCode: error.statusCode,
            code: `${error.code}`,
            message: error.message,
            ...(exposeError && isObject(error.data) ? error.data : {}),
        };
    }));
}
