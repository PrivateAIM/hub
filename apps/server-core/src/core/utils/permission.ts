/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PolicyData } from '@authup/access';
import { isPermissionError } from '@authup/access';
import { isPermissionDeniedError } from '@privateaim/errors';
import type { ActorContext } from '@privateaim/server-kit';

/**
 * Whether `error` is an authorization verdict — authup's `PermissionError`
 * (raised by the evaluator) or hub's own `PermissionDeniedError` — as opposed
 * to any other failure on the way there (a catalog fetch, a transport error,
 * a bug).
 */
export function isPermissionDenial(error: unknown): boolean {
    return isPermissionError(error) || isPermissionDeniedError(error);
}

/**
 * Ask whether the actor holds `name`, for code that branches on the answer
 * rather than failing on it. With `data` (the resource as ATTRIBUTES) the
 * full evaluation runs, so attribute policies on the grant are enforced;
 * without it only the pre-gate does.
 *
 * Only a permission denial reads as `false`. Every other error propagates:
 * swallowing it would turn an outage of the authorization path into a quiet
 * "not authorized" — or, where a caller falls back to another grant, into
 * that fallback being taken for the wrong reason.
 */
export async function holdsPermission(actor: ActorContext, name: string, data?: PolicyData): Promise<boolean> {
    try {
        if (data) {
            await actor.permissionEvaluator.evaluate({ name, data });
        } else {
            await actor.permissionEvaluator.preEvaluate({ name });
        }

        return true;
    } catch (error) {
        if (isPermissionDenial(error)) {
            return false;
        }

        throw error;
    }
}
