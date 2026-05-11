/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasInstanceof, isBaseError, isObject } from '@ebec/core';
import type { HubError } from './module.ts';
import { HUB_ERROR_INSTANCE } from './module.ts';

/**
 * Duck-type guard for HubError.
 *
 * Fast path: input has the HubError marker in its `@instanceof` chain.
 * Subclass instances also accumulate this marker, so this guard matches
 * any HubError subclass.
 *
 * Slow path: input is shape-compatible with HubError (BaseError + has
 * `issues: Issue[]`). Catches cases where the marker is missing — plain
 * objects rehydrated from JSON, older builds without the marker.
 */
export function isHubError(input: unknown): input is HubError {
    if (hasInstanceof(input, HUB_ERROR_INSTANCE)) {
        return true;
    }

    if (!isBaseError(input)) {
        return false;
    }

    if (!isObject(input)) {
        return false;
    }

    return Array.isArray(input.issues);
}
