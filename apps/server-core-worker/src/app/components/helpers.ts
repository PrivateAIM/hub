/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';
import type { ComponentMetadata, MessageDelivery } from 'hubwire';
import { isClientError } from 'hapic';
import {
    ANALYSIS_PROCESS_HEARTBEAT_INTERVAL_MS,
    ANALYSIS_PROCESS_HEARTBEAT_MAX_SILENCE_MS,
    TRANSIENT_ERROR_CODES,
} from './constants';
import type { Heartbeat } from './types';

/**
 * Run `beat` on an interval until `stop()` is called.
 * A long single step (one docker build layer, one push) emits no progress,
 * and server-core would judge the process stale; the beat keeps its row fresh.
 * Beats are skipped once `touch()` (real progress) has not been called for
 * ANALYSIS_PROCESS_HEARTBEAT_MAX_SILENCE_MS, so a hung stream goes stale
 * (see that constant for why stale alone does not recover it).
 *
 * A failed beat is logged, not thrown: the next one retries, and a worker
 * that can no longer publish at all should be judged stale.
 */
export function startHeartbeat(
    beat: () => unknown,
    logger?: Logger,
    intervalMs: number = ANALYSIS_PROCESS_HEARTBEAT_INTERVAL_MS,
    maxSilenceMs: number = ANALYSIS_PROCESS_HEARTBEAT_MAX_SILENCE_MS,
): Heartbeat {
    let touchedAt = Date.now();
    const timer = setInterval(() => {
        if (Date.now() - touchedAt > maxSilenceMs) {
            return;
        }

        Promise.try(beat)
            .catch((e) => logger?.warn({ message: 'Heartbeat failed', error: e }));
    }, intervalMs);

    return {
        touch: () => {
            touchedAt = Date.now();
        },
        stop: () => clearInterval(timer),
    };
}

/**
 * Whether a failure may go away on its own, so the same command is worth
 * running again: the request never reached its target (socket errors, the
 * docker daemon down) or the target answered 5xx/429 — core/storage/GitHub
 * through hapic, the docker daemon through dockerode (`statusCode`).
 * Everything else (4xx, a failing Dockerfile step, validation) is permanent.
 *
 * ponytail: errors docker reports INSIDE a build/push stream (`errorDetail`,
 * e.g. a registry 503 on push or a base-image pull) are plain errors and so
 * permanent; their text is the only signal and is not parsed.
 */
export function isTransientError(error: unknown): boolean {
    if (isClientError(error)) {
        if (!error.response) {
            return true;
        }

        return error.response.status >= 500 || error.response.status === 429;
    }

    if (!(Error.isError(error))) {
        return false;
    }

    if ('statusCode' in error && typeof error.statusCode === 'number') {
        return error.statusCode >= 500;
    }

    if ('code' in error && typeof error.code === 'string') {
        // ENOENT is only the daemon socket when connecting, else a missing file.
        if (error.code === 'ENOENT') {
            return 'syscall' in error && error.syscall === 'connect';
        }

        return TRANSIENT_ERROR_CODES.includes(error.code);
    }

    return false;
}

/**
 * Rethrow (the message bus retries it with backoff) instead of reporting
 * `*_FAILED`: only a transient error, and never on the last delivery attempt
 * (`metadata.delivery`, set by the driver), so a failure that outlasts the
 * retries is still reported, not dropped. Without a delivery (an in-process
 * call) nothing retries, so every attempt is the last.
 * A permanent error misread as transient therefore costs only the backoff.
 */
export function isRetryableFailure(error: unknown, metadata: ComponentMetadata): boolean {
    // set by the message bus driver on consume
    const delivery = metadata.delivery as MessageDelivery | undefined;
    const { attempt, maxAttempts } = delivery ?? { attempt: 1, maxAttempts: 1 };

    return attempt < maxAttempts && isTransientError(error);
}
