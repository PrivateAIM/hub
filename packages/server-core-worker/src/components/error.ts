/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentErrorOptions } from '@privateaim/server-kit';
import { ComponentError } from '@privateaim/server-kit';
import { ErrorCode } from '@privateaim/server-core-worker-kit';

export class BaseError extends ComponentError {
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
