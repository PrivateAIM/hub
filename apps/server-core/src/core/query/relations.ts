/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IQuery } from '@rapiq/core';
import type { ActorContext } from '@privateaim/server-kit';

/**
 * Pre-gate every requested relation with its target's read one-of, so an
 * `include` cannot reach an entity its direct read would refuse.
 *
 * ponytail: capability only. A realm-scoped target (registryProject) is not
 * narrowed per joined row — that needs a join-condition hook (plan 021).
 */
export async function preEvaluateRelationReads(
    query: IQuery,
    actor: ActorContext,
    readNames: Record<string, string[]>,
): Promise<void> {
    for (const relation of query.relations.value) {
        const names = readNames[relation.name];
        if (names) {
            await actor.permissionEvaluator.preEvaluateOneOf({ name: names });
        }
    }
}
