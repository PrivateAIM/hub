/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AnalysisBuilderErrorCode, ErrorCode } from '@privateaim/server-core-worker-kit';
import type { ComponentErrorOptions } from '@privateaim/server-kit';
import { BaseError } from '../error';

export class BuilderError extends BaseError {
    // Constructed directly rather than delegating to `super`: the base factories
    // return a `BaseError`, so delegating produced an object that was not a
    // `BuilderError` despite the annotation — and `registryNotFound` delegated to
    // `super.notFound`, emitting the `notFound` code instead of its own.
    static notFound(options?: ComponentErrorOptions): BuilderError {
        return new BuilderError({
            code: ErrorCode.NOT_FOUND,
            ...options,
        });
    }

    static registryNotFound(options?: ComponentErrorOptions): BuilderError {
        return new BuilderError({
            code: ErrorCode.REGISTRY_NOT_FOUND,
            ...options,
        });
    }

    static registryProjectNotFound(message?: string) {
        return new BuilderError({
            code: ErrorCode.REGISTRY_PROJECT_NOT_FOUND,
            message,
        });
    }

    static entrypointNotFound(message?: string) {
        return new BuilderError({
            code: AnalysisBuilderErrorCode.ENTRYPOINT_NOT_FOUND,
            message,
        });
    }

    static masterImageNotFound(message?: string) {
        return new BuilderError({
            code: AnalysisBuilderErrorCode.MASTER_IMAGE_NOT_FOUND,
            message,
        });
    }
}
