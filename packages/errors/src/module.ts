/*
 * Copyright (c) 2025-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { 
    BaseError, 
    INSTANCEOF_PROPERTY, 
    markInstanceof, 
    serializeInstanceofChain, 
} from '@ebec/core';
import type { HubErrorInput } from './types.ts';

export const HUB_ERROR_INSTANCE = Symbol.for('@privateaim/errors/HubError');

export class HubError extends BaseError {
    public readonly data?: Record<string, any>;

    constructor(input?: HubErrorInput) {
        super(input);
        markInstanceof(this, HUB_ERROR_INSTANCE);

        if (input && typeof input !== 'string' && input.data) {
            this.data = input.data;
        }
    }

    /**
     * `data` is spread over the base payload, so the `@instanceof` chain is
     * re-appended afterwards: it is the only thing `isHubError` reads, and a
     * `data` key of that name would otherwise overwrite it.
     */
    override toJSON() {
        return {
            ...super.toJSON(),
            ...(this.data ?? {}),
            [INSTANCEOF_PROPERTY]: serializeInstanceofChain(this),
        };
    }
}
