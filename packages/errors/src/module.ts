/*
 * Copyright (c) 2025-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BaseError, markInstanceof } from '@ebec/core';
import type { Issue } from 'validup';
import type { HubErrorInput } from './types.ts';

export const HUB_ERROR_INSTANCE = Symbol.for('@privateaim/errors/HubError');

export class HubError extends BaseError {
    public readonly issues: Issue[];

    public readonly data?: Record<string, any>;

    constructor(input?: HubErrorInput) {
        super(input);
        markInstanceof(this, HUB_ERROR_INSTANCE);

        this.issues = [];

        if (input && typeof input !== 'string' && input.data) {
            this.data = input.data;
        }
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            issues: this.issues,
            ...(this.data ?? {}),
        };
    }
}
