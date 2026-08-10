/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IFilter, IFilters } from '@rapiq/core';
import {
    FilterCompoundOperator,
    defineQuery,
    eq,
    isFilter,
    isFilters,
    or,
} from '@rapiq/core';
import type { Node } from '@privateaim/core-kit';
import { describe, expect, it } from 'vitest';
import { nodeSchema } from '../../../../src/core/entities/node/schema.ts';
import { appendQueryConditions, decodeQuery } from '../../../../src/core/query/index.ts';

// `appendQueryConditions` is how a server-derived scope (route realm, owner)
// becomes part of a decoded query. The contract these tests pin: the appended
// condition is NON-DISPLACEABLE — a client condition on the same field
// intersects with it instead of replacing it. Since @rapiq/core 2.0.0-beta.19
// the library's own merge paths (`Filters.merge`, `mergeQueries`) share this
// conjunctive semantic, so there is no replace-style code path left through
// which a client could shadow an appended scope.

const collectLeaves = (group: IFilters): IFilter[] => {
    const out: IFilter[] = [];
    for (const condition of group.value) {
        if (isFilters(condition)) {
            out.push(...collectLeaves(condition));
            continue;
        }
        if (isFilter(condition)) {
            out.push(condition);
        }
    }
    return out;
};

describe('core/query appendQueryConditions', () => {
    it('appends a scope onto a scopeless client query', () => {
        const query = decodeQuery({}, { schema: nodeSchema });

        const scoped = appendQueryConditions(query, eq('realmId', 'realm-a'));

        const leaves = collectLeaves(scoped.filters);
        expect(leaves).toHaveLength(1);
        expect(leaves[0]).toMatchObject({ field: 'realmId', value: 'realm-a' });
    });

    it('intersects with a same-field client filter instead of displacing it', () => {
        // The hostile pattern: a client filters on the very field the server
        // scopes by. Both conditions must survive as AND-conjuncts — the
        // result selects the intersection (here: nothing), never the
        // client's realm.
        const query = decodeQuery({ filter: { realmId: 'realm-attacker' } }, { schema: nodeSchema });

        const scoped = appendQueryConditions(query, eq('realmId', 'realm-a'));

        expect(scoped.filters.operator).toEqual(FilterCompoundOperator.AND);
        const realmValues = collectLeaves(scoped.filters)
            .filter((leaf) => leaf.field === 'realmId')
            .map((leaf) => leaf.value);
        expect(realmValues).toEqual(expect.arrayContaining(['realm-attacker', 'realm-a']));
        expect(realmValues).toHaveLength(2);
    });

    it('preserves a compound client tree as a branch beside the scope', () => {
        // A client `or(...)` must stay one branch of the AND wrap — flattening
        // it into the root would turn the scope into just another alternative.
        const query = defineQuery<Node>({ filters: or(eq('name', 'a'), eq('name', 'b')) });
        expect(query.filters.operator).toEqual(FilterCompoundOperator.OR);

        const scoped = appendQueryConditions(query, eq('realmId', 'realm-a'));

        expect(scoped.filters.operator).toEqual(FilterCompoundOperator.AND);
        expect(scoped.filters.value).toHaveLength(2);

        const [branch, scope] = scoped.filters.value;
        if (!isFilters(branch) || !isFilter(scope)) {
            throw new Error('expected the AND wrap to hold [compound branch, scope leaf]');
        }
        expect(branch.operator).toEqual(FilterCompoundOperator.OR);
        expect(collectLeaves(branch).map((leaf) => leaf.value)).toEqual(['a', 'b']);
        expect(scope).toMatchObject({ field: 'realmId', value: 'realm-a' });
    });

    it('does not mutate the input query', () => {
        const query = decodeQuery({ filter: { name: 'x' } }, { schema: nodeSchema });
        const filtersBefore = query.filters;
        const leavesBefore = collectLeaves(query.filters).length;

        const scoped = appendQueryConditions(query, eq('realmId', 'realm-a'));

        // the input's filter node is untouched; the wrap is a successor node
        expect(query.filters).toBe(filtersBefore);
        expect(collectLeaves(query.filters)).toHaveLength(leavesBefore);
        expect(scoped.filters).not.toBe(query.filters);

        // every other parameter node is carried over by reference
        expect(scoped.fields).toBe(query.fields);
        expect(scoped.relations).toBe(query.relations);
        expect(scoped.pagination).toBe(query.pagination);
        expect(scoped.sorts).toBe(query.sorts);
    });
});
