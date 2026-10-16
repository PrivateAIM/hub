/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuiltInPolicyType, PolicyData, isPermissionError } from '@authup/access';
import { isPermissionDeniedError } from '@privateaim/errors';
import type { ActorContext } from '../actor/index.ts';
import type { RecordReach } from './types.ts';

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
 * The evaluation input for one record. The `realmMatch` key is what makes
 * authup apply each grant's `realm_scope`: `attributes` alone apply none, and
 * the context field `realmId` names the permission's binding realm, not the
 * resource's (verified against authup beta.69).
 */
export function buildRecordPolicyData(reach: RecordReach): PolicyData {
    return new PolicyData({
        [BuiltInPolicyType.REALM_MATCH]: reach.realmId ?? null,
        [BuiltInPolicyType.ATTRIBUTES]: reach.attributes ?? {},
    });
}

/**
 * Throws a permission error (403) unless a grant of `name` (any of, for an
 * array) reaches the record's realm and satisfies its policies.
 */
export async function assertRecordReach(
    actor: Pick<ActorContext, 'permissionEvaluator'>,
    name: string | string[],
    reach: RecordReach,
): Promise<void> {
    const data = buildRecordPolicyData(reach);

    if (Array.isArray(name)) {
        await actor.permissionEvaluator.evaluateOneOf({ name, data });
        return;
    }

    await actor.permissionEvaluator.evaluate({ name, data });
}

/**
 * {@link assertRecordReach} as a predicate. Only a permission denial reads
 * as `false`; any other error propagates, so an outage of the authorization
 * path never turns into a quiet "not authorized".
 */
export async function reachesRecord(actor: ActorContext, name: string | string[], reach: RecordReach): Promise<boolean> {
    try {
        await assertRecordReach(actor, name, reach);
        return true;
    } catch (error) {
        if (isPermissionDenial(error)) {
            return false;
        }

        throw error;
    }
}

/**
 * Whether a grant of `name` (any of, for an array) reaches every realm
 * without a narrowing policy — `realm_scope: any`, as the built-in `admin`
 * role and the `system` client hold. It replaces "is a master-realm member".
 * Fail-closed: a policy-bearing `any` grant compiles to `conditional`.
 */
export async function hasUnboundedReach(
    actor: Pick<ActorContext, 'permissionEvaluator'>,
    name: string | string[],
): Promise<boolean> {
    try {
        const result = await actor.permissionEvaluator.compile({ name });
        return result.verdict === 'allow';
    } catch (error) {
        if (isPermissionDenial(error)) {
            return false;
        }

        throw error;
    }
}

/**
 * Ask whether the actor holds `name`, for code that branches on the answer
 * rather than failing on it. With `data` the full evaluation runs (build it
 * with {@link buildRecordPolicyData} so realm reach applies); without it only
 * the capability pre-gate does. Only a permission denial reads as `false`.
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
