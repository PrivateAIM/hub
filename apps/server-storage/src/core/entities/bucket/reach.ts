/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ICondition } from '@rapiq/core';
import {
    and,
    eq,
    inArray,
    or,
} from '@rapiq/core';
import { isPermissionError } from '@authup/access';
import type { ActorContext } from '@privateaim/server-kit';
import { compileReadReach, prefixConditionFields } from '@privateaim/server-kit';
import { BUCKET_READ_PERMISSIONS } from './constants.ts';

/**
 * The buckets an identity may read: those one of {@link BUCKET_READ_PERMISSIONS}
 * reaches through the bucket's realm, and those it owns. Holding none of the
 * permissions is no 403: the owner condition alone remains, which matches
 * nothing for a caller that owns nothing.
 *
 * `path` re-roots the condition onto a relation (`bucket` for bucket files):
 * a file is judged by its bucket, never by its own (the uploader's) realm.
 *
 * Answers `undefined` when the grant reaches every bucket.
 */
export async function resolveBucketReadReach(
    actor: ActorContext,
    path = '',
): Promise<ICondition | undefined> {
    const conditions: ICondition[] = [];

    let granted = true;

    try {
        await actor.permissionEvaluator.preEvaluateOneOf({ name: BUCKET_READ_PERMISSIONS });
    } catch (e) {
        if (!isPermissionError(e)) {
            throw e;
        }

        granted = false;
    }

    if (granted) {
        const grant = await compileReadReach(actor, { names: BUCKET_READ_PERMISSIONS });

        if (!grant) {
            return undefined;
        }

        conditions.push(grant);
    }

    if (actor.identity) {
        conditions.push(and(
            eq('actorType', actor.identity.type),
            eq('actorId', actor.identity.id),
        ));
    }

    if (conditions.length === 0) {
        return inArray('id', []);
    }

    return prefixConditionFields(
        conditions.length === 1 ? conditions[0] : or(...conditions),
        path,
    );
}
