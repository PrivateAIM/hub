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

export const INTERNAL_ERROR_INSTANCE = Symbol.for('@privateaim/errors/InternalError');

export class InternalError extends HubError {
    constructor(input?: string | HubErrorOptions) {
        const options: HubErrorOptions = typeof input === 'string' ? { message: input } : (input ?? {});
        const { message, ...rest } = options;
        super({
            ...rest,
            code: ErrorCode.INTERNAL_ERROR,
            message: message ?? 'An internal error occurred.',
        });
        markInstanceof(this, INTERNAL_ERROR_INSTANCE);
    }
}
