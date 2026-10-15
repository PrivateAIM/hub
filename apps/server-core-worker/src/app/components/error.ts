/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ErrorCode } from '@privateaim/server-core-worker-kit';
import type { ComponentErrorOptions } from './types';

export class BaseError extends Error {
    public readonly code?: string | null;

    constructor(input: ComponentErrorOptions) {
        super(input.message, { cause: input.cause });

        this.code = input.code;
    }

    // --------------------------------------------------------------------

    static notFound(
        options: ComponentErrorOptions,
    ) {
        return new BaseError({
            code: ErrorCode.NOT_FOUND,
            ...options,
        });
    }

    static registryNotFound(
        options: ComponentErrorOptions,
    ) {
        return new BaseError({
            code: ErrorCode.REGISTRY_NOT_FOUND,
            ...options,
        });
    }
}
