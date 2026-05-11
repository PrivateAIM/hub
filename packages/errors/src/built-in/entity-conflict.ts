/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { markInstanceof } from '@ebec/core';
import { ErrorCode } from '../constants.ts';
import { HubError } from '../module.ts';
import type { HubEntityErrorOptions } from '../types.ts';

export const ENTITY_CONFLICT_ERROR_INSTANCE = Symbol.for('@privateaim/errors/EntityConflictError');

export class EntityConflictError extends HubError {
    constructor(input?: string | HubEntityErrorOptions) {
        const options: HubEntityErrorOptions = typeof input === 'string' ? { message: input } : (input ?? {});
        const {
            entity, 
            message, 
            ...rest 
        } = options;
        super({
            ...rest,
            code: ErrorCode.ENTITY_CONFLICT,
            message: message ?? (entity ? `The ${entity} already exists.` : 'Entity already exists.'),
        });
        markInstanceof(this, ENTITY_CONFLICT_ERROR_INSTANCE);
    }
}
