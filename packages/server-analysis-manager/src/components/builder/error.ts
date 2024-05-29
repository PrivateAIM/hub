/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuilderErrorCode } from '@privateaim/server-analysis-manager-kit';
import type { ComponentErrorOptions } from '@privateaim/server-kit';
import { BaseError } from '../error';

export class BuilderError extends BaseError {
    static notFound(options?: ComponentErrorOptions): BuilderError {
        return super.notFound(options);
    }

    static registryNotFound(options?: ComponentErrorOptions): BuilderError {
        return super.notFound(options);
    }

    static entrypointNotFound(message?: string) {
        return new BuilderError({
            code: BuilderErrorCode.ENTRYPOINT_NOT_FOUND,
            message,
        });
    }

    static masterImageNotFound(message?: string) {
        return new BuilderError({
            code: BuilderErrorCode.MASTER_IMAGE_NOT_FOUND,
            message,
        });
    }
}
