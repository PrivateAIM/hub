/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { FakePermissionEvaluator } from '@authup/server-test-kit';
import {
    Query,
    eq,
    inArray,
    isFilter,
    isFilters,
} from '@rapiq/core';
import type { ICondition, IQuery } from '@rapiq/core';
import { describe, expect, it } from 'vitest';
import { scopeReadQuery } from '../../../src';

function createActor(realm?: { id: string, name: string }) {
    return { permissionEvaluator: new FakePermissionEvaluator(), realm };
}

// On a query without client filters, the scope is the only condition in the group.
function appendedCondition(query: IQuery): ICondition | undefined {
    if (!isFilters(query.filters)) {
        return undefined;
    }

    return query.filters.value.find((child) => isFilter(child) || isFilters(child));
}

describe('scopeReadQuery', () => {
    const names = ['event_read', 'event_delete'];

    it('pre-gates the names as a disjunction and throws on a missing grant', async () => {
        const actor = createActor({ id: 'r1', name: 'r1' });
        actor.permissionEvaluator.denyAll(new Error('denied'));

        await expect(scopeReadQuery(new Query({}), actor, { names })).rejects.toThrow('denied');
        expect(actor.permissionEvaluator.preEvaluateOneOfCalls[0].name).toEqual(names);
        expect(actor.permissionEvaluator.compileCalls).toHaveLength(0);
    });

    it('skips compile for a capability-only gate', async () => {
        const actor = createActor({ id: 'r1', name: 'r1' });
        const query = new Query({});

        await expect(scopeReadQuery(query, actor, { names, compile: false })).resolves.toBe(query);
        expect(actor.permissionEvaluator.compileCalls).toHaveLength(0);
    });

    it('returns the query unchanged on an allow verdict', async () => {
        const actor = createActor({ id: 'r1', name: 'r1' });
        actor.permissionEvaluator.setCompileResult({ verdict: 'allow' });
        const query = new Query({});

        await expect(scopeReadQuery(query, actor, { names })).resolves.toBe(query);
        // No realm column forwarded: naming one makes authup refuse to lower grant policies.
        expect(actor.permissionEvaluator.compileCalls[0]).toEqual({ name: names });
    });

    it('appends the compiled reach on a conditional verdict', async () => {
        const actor = createActor({ id: 'r1', name: 'r1' });
        const condition = eq('realmId', 'r2');
        actor.permissionEvaluator.setCompileResult({ verdict: 'conditional', condition });

        const scoped = await scopeReadQuery(new Query({}), actor, { names });
        expect(appendedCondition(scoped)).toEqual(condition);
    });

    it('matches nothing on a deny verdict', async () => {
        const actor = createActor({ id: 'r1', name: 'r1' });
        actor.permissionEvaluator.setCompileResult({ verdict: 'deny' });

        const scoped = await scopeReadQuery(new Query({}), actor, { names });
        expect(appendedCondition(scoped)).toEqual(inArray('id', []));
    });

    it('narrows a post verdict to the actor realm on the given column', async () => {
        const actor = createActor({ id: 'r1', name: 'r1' });

        const scoped = await scopeReadQuery(new Query({}), actor, { names, realmAttributeName: 'nodeRealmId' });
        expect(appendedCondition(scoped)).toEqual(eq('nodeRealmId', 'r1'));
        expect(actor.permissionEvaluator.compileCalls[0]).toEqual({ name: names, realmAttributeName: 'nodeRealmId' });
    });

    it('narrows a post verdict to nothing for an actor without a realm', async () => {
        const scoped = await scopeReadQuery(new Query({}), createActor(), { names });
        expect(appendedCondition(scoped)).toEqual(inArray('id', []));
    });
});
