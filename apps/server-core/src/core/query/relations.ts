/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IQuery } from '@rapiq/core';
import type { ActorContext } from '@privateaim/server-kit';

/**
 * Check the read grant of every requested relation, so an `include` cannot
 * reach an entity that a direct read of it would refuse.
 *
 * Deliberate simplification: only the grant is checked. Joined rows of a
 * realm-scoped target (registryProject) are not narrowed by realm; that needs
 * a hook on the join condition (plan 021).
 */
export async function preEvaluateRelationReads(
    query: IQuery,
    actor: ActorContext,
    readPermissionsByRelation: Record<string, string[]>,
): Promise<void> {
    for (const relation of query.relations.value) {
        const names = readPermissionsByRelation[relation.name];
        if (names) {
            await actor.permissionEvaluator.preEvaluateOneOf({ name: names });
        }
    }
}
