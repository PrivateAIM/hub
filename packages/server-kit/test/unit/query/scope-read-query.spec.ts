/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionError } from '@authup/access';
import { FakePermissionEvaluator } from '@authup/server-test-kit';
import {
    Field,
    Fields,
    Query,
    defineSchema,
    eq,
    inArray,
    isFilter,
    isFilters,
} from '@rapiq/core';
import type { ICondition, IQuery } from '@rapiq/core';
import { describe, expect, it } from 'vitest';
import { appendQueryConditions, findManyScoped, scopeReadQuery } from '../../../src';
import type { EntityRepositoryFindManyResult, ReadScope } from '../../../src';

function createActor(realm?: { id: string, name: string }) {
    return { permissionEvaluator: new FakePermissionEvaluator(), realm };
}

type Row = {
    id?: string,
    realmId?: string | null,
    name?: string,
    /** Gated: outside the defaults, loaded only when a read names it. */
    secret?: string,
    /** A relation the read may include. */
    parent?: { id?: string, name?: string },
};

const rowSchema = defineSchema<Row>({
    name: 'row',
    fields: {
        default: ['id', 'realmId', 'name'],
        allowed: ['id', 'realmId', 'name', 'secret'],
    },
});

/** A decoded projection, as `decodeQuery` materializes a `fields` parameter. */
function project(...names: string[]): Query {
    return new Query({ fields: new Fields(names.map((name) => new Field(name))) });
}

/**
 * Reads the stored rows like a database repository: the projection decides
 * the loaded columns (every stored column when the read names none) and an
 * `id` condition narrows the rows. Records every query and every row it
 * returned, so a spec can assert how often the rows were read.
 */
class FakeRowRepository {
    calls: IQuery[] = [];

    returned: Row[] = [];

    constructor(protected stored: Row[], protected total: number = stored.length) {}

    async findMany(query: IQuery): Promise<EntityRepositoryFindManyResult<Row>> {
        this.calls.push(query);

        const names = query.fields.value.map((field) => field.name);
        const id = readIdCondition(query);
        const data = this.stored
            .filter((row) => id === undefined || row.id === id)
            .map((row) => this.load(row, names));

        this.returned.push(...data);

        return {
            data,
            meta: {
                total: this.total,
                limit: 50,
                offset: 0,
            },
        };
    }

    protected load(row: Row, names: string[]): Row {
        if (names.length === 0) {
            return { ...row };
        }

        const output: Row = {};

        for (const name of names) {
            const [head, tail] = name.split('.');

            if (head === 'parent' && tail) {
                output.parent = { ...output.parent, [tail]: row.parent?.[tail] };
            } else if (head in row) {
                output[head] = row[head];
            }
        }

        return output;
    }
}

function readIdCondition(query: IQuery): unknown {
    const pending: ICondition[] = [query.filters];

    while (pending.length > 0) {
        const condition = pending.pop();

        if (isFilters(condition)) {
            pending.push(...condition.value);
        } else if (isFilter(condition) && condition.field === 'id') {
            return condition.value;
        }
    }

    return undefined;
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

        await expect(scopeReadQuery(new Query({}), actor, { names, schema: rowSchema })).rejects.toThrow('denied');
        expect(actor.permissionEvaluator.preEvaluateOneOfCalls[0].name).toEqual(names);
        expect(actor.permissionEvaluator.compileCalls).toHaveLength(0);
    });

    it('skips compile for a capability-only gate', async () => {
        const actor = createActor({ id: 'r1', name: 'r1' });
        const query = new Query({});

        await expect(scopeReadQuery(query, actor, {
            names, 
            schema: rowSchema, 
            compile: false, 
        })).resolves.toEqual({
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

        await expect(scopeReadQuery(query, actor, { names, schema: rowSchema })).resolves.toEqual({
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

        const scoped = await scopeReadQuery(new Query({}), actor, { names, schema: rowSchema });

        expect(appendedCondition(scoped.query)).toEqual(condition);
        expect(scoped.post).toBe(false);
    });

    it('matches nothing on a deny verdict', async () => {
        const actor = createActor({ id: 'r1', name: 'r1' });

        actor.permissionEvaluator.setCompileResult({ verdict: 'deny' });

        const scoped = await scopeReadQuery(new Query({}), actor, { names, schema: rowSchema });

        expect(appendedCondition(scoped.query)).toEqual(inArray('id', []));
        expect(scoped.post).toBe(false);
    });

    it('leaves a post verdict unnarrowed and names the fields the per-row decision reads', async () => {
        const actor = createActor({ id: 'r1', name: 'r1' });
        const query = new Query({});

        await expect(scopeReadQuery(query, actor, {
            names,
            schema: rowSchema,
            realmAttributeName: 'nodeRealmId',
        })).resolves.toEqual({
            query,
            post: true,
            names,
            realmAttributeName: 'nodeRealmId',
            // The defaults, the realm column and the key; never the gated `secret`.
            checkFields: ['id', 'realmId', 'name', 'nodeRealmId'],
        });
        expect(actor.permissionEvaluator.compileCalls[0]).toEqual({ name: names, realmAttributeName: 'nodeRealmId' });
    });
});

describe('findManyScoped', () => {
    const names = ['event_read', 'event_delete'];

    const postScope = (query: IQuery, realmAttributeName?: string): ReadScope => ({
        query,
        post: true,
        names,
        checkFields: ['id', 'realmId', 'name', ...(realmAttributeName ? [realmAttributeName] : [])],
        ...(realmAttributeName ? { realmAttributeName } : {}),
    });

    const stored: Row[] = [
        {
            id: 'own-open',
            realmId: 'r1',
            name: 'open',
            secret: 's1',
            parent: { id: 'p1', name: 'parent' },
        },
        {
            id: 'own-closed',
            realmId: 'r1',
            name: 'closed',
            secret: 's2',
            parent: { id: 'p1', name: 'parent' },
        },
        {
            id: 'foreign-open',
            realmId: 'r2',
            name: 'open',
            secret: 's3',
            parent: { id: 'p2', name: 'parent' },
        },
        {
            id: 'global-open',
            realmId: null,
            name: 'open',
            secret: 's4',
            parent: { id: 'p3', name: 'parent' },
        },
    ];

    it('returns a lowered read as it is, without evaluating a row', async () => {
        const actor = createRowActor(() => false);
        const repository = new FakeRowRepository([{ id: 'a', realmId: 'r1' }]);
        const query = project('id');

        const result = await findManyScoped(repository, {
            query,
            post: false,
            names,
        }, actor);

        expect(result.data).toEqual([{ id: 'a' }]);
        expect(repository.calls).toEqual([query]);
        expect(actor.permissionEvaluator.evaluateOneOfCalls).toHaveLength(0);
    });

    it('keeps exactly the rows the evaluation allows on a post verdict, own-realm rows included', async () => {
        // A policy that cannot lower: only rows named `open` are granted.
        const actor = createRowActor((row) => row.name === 'open');
        const repository = new FakeRowRepository(stored, 12);

        const result = await findManyScoped(repository, postScope(project('id', 'realmId', 'name')), actor);

        expect(result.data.map((row) => row.id)).toEqual(['own-open', 'foreign-open', 'global-open']);
        // The total stays the candidate count, so paging by it reaches every page.
        expect(result.meta).toEqual({
            total: 12,
            limit: 50,
            offset: 0,
        });
    });

    it('evaluates any-of the names against the default row and its raw realm', async () => {
        const actor = createRowActor(() => true);
        const repository = new FakeRowRepository([{
            id: 'a', 
            realmId: null, 
            name: 'open', 
        }]);

        await findManyScoped(repository, postScope(project('id', 'realmId', 'name')), actor);

        const [call] = actor.permissionEvaluator.evaluateOneOfCalls;

        expect(call.name).toEqual(names);
        expect(call.data.get('realmMatch')).toBeNull();
        expect(call.data.get('attributes')).toEqual({
            id: 'a', 
            realmId: null, 
            name: 'open', 
        });
    });

    it('decides a sparse fieldset on the whole default row, in one read, and returns only the asked fields', async () => {
        const actor = createRowActor((row) => row.name === 'open');
        const repository = new FakeRowRepository(stored);

        const result = await findManyScoped(repository, postScope(project('id')), actor);

        expect(result.data).toEqual([{ id: 'own-open' }, { id: 'foreign-open' }, { id: 'global-open' }]);
        expect(repository.calls).toHaveLength(1);

        const evaluated = actor.permissionEvaluator.evaluateOneOfCalls.map((call) => call.data.get('attributes'));

        expect(evaluated).toContainEqual({
            id: 'own-closed', 
            realmId: 'r1', 
            name: 'closed', 
        });
        expect(actor.permissionEvaluator.evaluateOneOfCalls.map((call) => call.data.get('realmMatch')))
            .toEqual(['r1', 'r1', 'r2', null]);
    });

    it('returns the very rows it evaluated: there is no second read to diverge from', async () => {
        const actor = createRowActor((row) => row.name === 'open');
        const repository = new FakeRowRepository(stored);

        const result = await findManyScoped(repository, postScope(project('id', 'name')), actor);

        expect(repository.calls).toHaveLength(1);
        // Every response row is an object of that one read.
        expect(result.data.every((row) => repository.returned.includes(row))).toBe(true);
    });

    it('trims every field loaded only for the check, the key excepted', async () => {
        const actor = createRowActor((row) => row.name === 'open');
        const repository = new FakeRowRepository(stored);

        // `id` stays: a database read projects the key on every sparse fieldset.
        const result = await findManyScoped(repository, postScope(project('name')), actor);

        expect(result.data).toEqual([
            { id: 'own-open', name: 'open' },
            { id: 'foreign-open', name: 'open' },
            { id: 'global-open', name: 'open' },
        ]);
    });

    it('loads a realm column outside the defaults for the check and trims it again', async () => {
        const actor = createRowActor(() => true);
        const repository = new FakeRowRepository([{
            id: 'a', 
            realmId: 'r9', 
            secret: 'r7', 
        }]);

        const result = await findManyScoped(repository, postScope(project('id'), 'secret'), actor);

        expect(actor.permissionEvaluator.evaluateOneOfCalls[0].data.get('realmMatch')).toEqual('r7');
        expect(result.data).toEqual([{ id: 'a' }]);
    });

    it('reads the realm from the named column', async () => {
        const actor = createRowActor(() => true);
        const repository = new FakeRowRepository([{ id: 'a', realmId: 'r9' }]);

        await findManyScoped(repository, postScope(project('id', 'realmId'), 'id'), actor);

        expect(actor.permissionEvaluator.evaluateOneOfCalls[0].data.get('realmMatch')).toEqual('a');
    });

    it('never loads a gated field for the check, nor returns it', async () => {
        const actor = createRowActor(() => true);
        const repository = new FakeRowRepository(stored);

        const result = await findManyScoped(repository, postScope(project('id')), actor);

        expect(repository.calls[0].fields.value.map((field) => field.name)).not.toContain('secret');
        expect(result.data.every((row) => !('secret' in row))).toBe(true);
    });

    it('keeps an asked-for gated field out of the decision and leaves its gate to the service', async () => {
        const actor = createRowActor(() => true);
        const repository = new FakeRowRepository(stored);

        const result = await findManyScoped(repository, postScope(project('id', 'name', 'secret')), actor);

        // The policy sees the default row whether or not the read named the secret.
        expect(actor.permissionEvaluator.evaluateOneOfCalls.every((call) => !('secret' in call.data.get<Row>('attributes'))))
            .toBe(true);
        // The response carries it as asked; the owning service gates it.
        expect(result.data.map((row) => row.secret)).toEqual(['s1', 's2', 's3', 's4']);
    });

    it('decides on the root row and leaves an included relation as it was read', async () => {
        const actor = createRowActor((row) => row.name === 'open');
        const repository = new FakeRowRepository(stored);

        const result = await findManyScoped(repository, postScope(project('id', 'parent.name')), actor);

        expect(result.data).toEqual([
            { id: 'own-open', parent: { name: 'parent' } },
            { id: 'foreign-open', parent: { name: 'parent' } },
            { id: 'global-open', parent: { name: 'parent' } },
        ]);
        // The relation is no attribute of the row's own policy.
        expect(actor.permissionEvaluator.evaluateOneOfCalls.every((call) => !('parent' in call.data.get<Row>('attributes'))))
            .toBe(true);
    });

    it('evaluates an unprojected read on the row as loaded and trims nothing', async () => {
        const actor = createRowActor((row) => row.name === 'open');
        const repository = new FakeRowRepository([{
            id: 'a', 
            realmId: 'r1', 
            name: 'open', 
        }]);

        const result = await findManyScoped(repository, postScope(new Query({})), actor);

        expect(repository.calls[0].fields.value).toHaveLength(0);
        expect(result.data).toEqual([{
            id: 'a', 
            realmId: 'r1', 
            name: 'open', 
        }]);
    });

    it('decides a record read on the same single read', async () => {
        const actor = createRowActor((row) => row.name === 'open');
        const repository = new FakeRowRepository(stored);

        const read = async (id: string) => {
            repository.calls = [];

            const { data } = await findManyScoped(repository, postScope(appendQueryConditions(project('id'), eq('id', id))), actor);

            expect(repository.calls).toHaveLength(1);

            return data;
        };

        await expect(read('foreign-open')).resolves.toEqual([{ id: 'foreign-open' }]);
        await expect(read('own-closed')).resolves.toEqual([]);
    });

    it('propagates anything but a permission denial', async () => {
        const permissionEvaluator = new FakePermissionEvaluator(({ method }) => {
            if (method === 'evaluateOneOf') {
                throw new Error('catalog unavailable');
            }
        });
        const repository = new FakeRowRepository([{ id: 'a', realmId: 'r1' }]);

        await expect(findManyScoped(repository, postScope(project('id')), { permissionEvaluator }))
            .rejects.toThrow('catalog unavailable');
    });

    it('reads an empty page once', async () => {
        const actor = createRowActor(() => true);
        const repository = new FakeRowRepository([]);

        const result = await findManyScoped(repository, postScope(project('id')), actor);

        expect(result.data).toEqual([]);
        expect(repository.calls).toHaveLength(1);
    });
});
