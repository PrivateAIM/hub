/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionError } from '@authup/access';
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
import { findManyScoped, scopeReadQuery } from '../../../src';
import type { EntityRepositoryFindManyResult } from '../../../src';

function createActor(realm?: { id: string, name: string }) {
    return { permissionEvaluator: new FakePermissionEvaluator(), realm };
}

type Row = {
    id: string, 
    realmId?: string | null, 
    name?: string 
};

/**
 * Answers the page read with `page` and the read of the stored rows (the
 * `id` membership the helper appends) with `stored`.
 */
class FakeRowRepository {
    calls: IQuery[] = [];

    constructor(protected page: Row[], protected stored: Row[] = page, protected total: number = page.length) {}

    async findMany(query: IQuery): Promise<EntityRepositoryFindManyResult<Row>> {
        this.calls.push(query);

        if (this.calls.length === 1) {
            return {
                data: this.page,
                meta: {
                    total: this.total, 
                    limit: 50, 
                    offset: 0, 
                }, 
            };
        }

        return { data: this.stored, meta: { total: this.stored.length } };
    }
}

/** An evaluator whose grant reaches exactly the rows `reaches` accepts. */
function createRowActor(reaches: (row: Row) => boolean, realm = { id: 'r1', name: 'r1' }) {
    const permissionEvaluator = new FakePermissionEvaluator(({ method, ctx }) => {
        if (method !== 'evaluateOneOf') {
            return;
        }

        if (!reaches(ctx.data.get<Row>('attributes'))) {
            throw PermissionError.evaluationFailed(ctx.name);
        }
    });

    return { permissionEvaluator, realm };
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

        await expect(scopeReadQuery(query, actor, { names, compile: false })).resolves.toEqual({
            query,
            post: false,
            names,
        });
        expect(actor.permissionEvaluator.compileCalls).toHaveLength(0);
    });

    it('returns the query unchanged on an allow verdict', async () => {
        const actor = createActor({ id: 'r1', name: 'r1' });

        actor.permissionEvaluator.setCompileResult({ verdict: 'allow' });

        const query = new Query({});

        await expect(scopeReadQuery(query, actor, { names })).resolves.toEqual({
            query,
            post: false,
            names,
        });
        // No realm column forwarded: naming one makes authup refuse to lower grant policies.
        expect(actor.permissionEvaluator.compileCalls[0]).toEqual({ name: names });
    });

    it('appends the compiled reach on a conditional verdict', async () => {
        const actor = createActor({ id: 'r1', name: 'r1' });
        const condition = eq('realmId', 'r2');

        actor.permissionEvaluator.setCompileResult({ verdict: 'conditional', condition });

        const scoped = await scopeReadQuery(new Query({}), actor, { names });

        expect(appendedCondition(scoped.query)).toEqual(condition);
        expect(scoped.post).toBe(false);
    });

    it('matches nothing on a deny verdict', async () => {
        const actor = createActor({ id: 'r1', name: 'r1' });

        actor.permissionEvaluator.setCompileResult({ verdict: 'deny' });

        const scoped = await scopeReadQuery(new Query({}), actor, { names });

        expect(appendedCondition(scoped.query)).toEqual(inArray('id', []));
        expect(scoped.post).toBe(false);
    });

    it('leaves a post verdict unnarrowed and flags it for the per-row decision', async () => {
        const actor = createActor({ id: 'r1', name: 'r1' });
        const query = new Query({});

        await expect(scopeReadQuery(query, actor, { names, realmAttributeName: 'nodeRealmId' })).resolves.toEqual({
            query,
            post: true,
            names,
            realmAttributeName: 'nodeRealmId',
        });
        expect(actor.permissionEvaluator.compileCalls[0]).toEqual({ name: names, realmAttributeName: 'nodeRealmId' });
    });
});

describe('findManyScoped', () => {
    const names = ['event_read', 'event_delete'];

    it('returns a lowered read as it is, without evaluating a row', async () => {
        const actor = createRowActor(() => false);
        const repository = new FakeRowRepository([{ id: 'a', realmId: 'r1' }]);
        const query = new Query({});

        const result = await findManyScoped(repository, {
            query,
            post: false,
            names,
        }, actor);

        expect(result.data.map((row) => row.id)).toEqual(['a']);
        expect(repository.calls).toEqual([query]);
        expect(actor.permissionEvaluator.evaluateOneOfCalls).toHaveLength(0);
    });

    it('keeps exactly the rows the evaluation allows on a post verdict, own-realm rows included', async () => {
        // A policy that cannot lower: only rows named `open` are granted.
        const actor = createRowActor((row) => row.name === 'open');
        const repository = new FakeRowRepository([
            {
                id: 'own-open',
                realmId: 'r1',
                name: 'open',
            },
            {
                id: 'own-closed',
                realmId: 'r1',
                name: 'closed',
            },
            {
                id: 'foreign-open',
                realmId: 'r2',
                name: 'open',
            },
            {
                id: 'global-open',
                realmId: null,
                name: 'open',
            },
        ], undefined, 12);

        const result = await findManyScoped(repository, {
            query: new Query({}),
            post: true,
            names,
        }, actor);

        expect(result.data.map((row) => row.id)).toEqual(['own-open', 'foreign-open', 'global-open']);
        // The total stays the candidate count, so paging by it reaches every page.
        expect(result.meta).toEqual({
            total: 12,
            limit: 50,
            offset: 0,
        });
    });

    it('evaluates any-of the names against the stored row and its raw realm', async () => {
        const actor = createRowActor(() => true);
        const repository = new FakeRowRepository([{ id: 'a', realmId: null }]);

        await findManyScoped(repository, {
            query: new Query({}),
            post: true,
            names,
        }, actor);

        const [call] = actor.permissionEvaluator.evaluateOneOfCalls;

        expect(call.name).toEqual(names);
        expect(call.data.get('realmMatch')).toBeNull();
        expect(call.data.get('attributes')).toEqual({ id: 'a', realmId: null });
    });

    it('decides on the stored row, not on a sparse projection of it', async () => {
        const actor = createRowActor((row) => row.name === 'open');
        const repository = new FakeRowRepository(
            [{ id: 'a' }, { id: 'b' }],
            [
                {
                    id: 'a',
                    realmId: 'r2',
                    name: 'open',
                },
                {
                    id: 'b',
                    realmId: 'r1',
                    name: 'closed',
                },
            ],
        );

        const result = await findManyScoped(repository, {
            query: new Query({}),
            post: true,
            names,
        }, actor);

        // The projection is returned untouched; the decision row is not leaked into it.
        expect(result.data).toEqual([{ id: 'a' }]);
        expect(appendedCondition(repository.calls[1])).toEqual(inArray('id', ['a', 'b']));
    });

    it('reads the realm from the named column', async () => {
        const actor = createRowActor(() => true);
        const repository = new FakeRowRepository([{ id: 'a', realmId: 'r9' }]);

        await findManyScoped(repository, {
            query: new Query({}),
            post: true,
            names,
            realmAttributeName: 'id',
        }, actor);

        expect(actor.permissionEvaluator.evaluateOneOfCalls[0].data.get('realmMatch')).toEqual('a');
    });

    it('propagates anything but a permission denial', async () => {
        const permissionEvaluator = new FakePermissionEvaluator(({ method }) => {
            if (method === 'evaluateOneOf') {
                throw new Error('catalog unavailable');
            }
        });
        const repository = new FakeRowRepository([{ id: 'a', realmId: 'r1' }]);

        await expect(findManyScoped(repository, {
            query: new Query({}),
            post: true,
            names,
        }, { permissionEvaluator })).rejects.toThrow('catalog unavailable');
    });

    it('does not read the stored rows of an empty page', async () => {
        const actor = createRowActor(() => true);
        const repository = new FakeRowRepository([]);

        const result = await findManyScoped(repository, {
            query: new Query({}),
            post: true,
            names,
        }, actor);

        expect(result.data).toEqual([]);
        expect(repository.calls).toHaveLength(1);
    });
});
