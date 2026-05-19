/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { markInstanceof } from '@ebec/core';
import { ErrorCode } from '../constants.ts';
import { HubError } from '../module.ts';
import type { HubErrorOptions } from '../types.ts';

export const BAD_REQUEST_ERROR_INSTANCE = Symbol.for('@privateaim/errors/BadRequestError');

export class BadRequestError extends HubError {
    constructor(input?: string | HubErrorOptions) {
        const options: HubErrorOptions = typeof input === 'string' ? { message: input } : (input ?? {});
        super({
            ...options,
            code: ErrorCode.BAD_REQUEST,
        });
        markInstanceof(this, BAD_REQUEST_ERROR_INSTANCE);
    }
}
