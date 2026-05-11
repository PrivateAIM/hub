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

export const ENTITY_RELATION_INVALID_ERROR_INSTANCE = Symbol.for('@privateaim/errors/EntityRelationInvalidError');

export class EntityRelationInvalidError extends HubError {
    constructor(input?: string | HubErrorOptions) {
        const options: HubErrorOptions = typeof input === 'string' ? { message: input } : (input ?? {});
        const { message, ...rest } = options;
        super({
            ...rest,
            code: ErrorCode.ENTITY_RELATION_INVALID,
            message: message ?? 'Entity relation is invalid.',
        });
        markInstanceof(this, ENTITY_RELATION_INVALID_ERROR_INSTANCE);
    }
}
