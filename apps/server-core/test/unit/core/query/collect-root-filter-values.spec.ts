/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import type { ICondition } from '@rapiq/core';
import {
    Filter,
    FilterCompoundOperator,
    FilterFieldOperator,
    Filters,
    Query,
} from '@rapiq/core';
import {
    describe,
    expect,
    it,
} from 'vitest';
import { collectRootFilterValues } from '../../../../src/core/query/index.ts';

// The telemetry-backed log controllers forward the collected values as label
// equalities to the telemetry read/delete endpoints. The rapiq v2 expression
// dialect can express negation/comparison/OR (which the schema allow-list does
// not constrain — it only constrains field names), so a crafted filter must be
// rejected rather than silently flattened to a bare (inverse) equality.
const query = (filters: Filters) => new Query({ filters });
const and = (...conditions: ICondition[]) => new Filters(FilterCompoundOperator.AND, conditions);
const or = (...conditions: ICondition[]) => new Filters(FilterCompoundOperator.OR, conditions);
const eq = (field: string, value: string) => new Filter(FilterFieldOperator.EQUAL, field, value);
const ne = (field: string, value: string) => new Filter(FilterFieldOperator.NOT_EQUAL, field, value);
const lt = (field: string, value: string) => new Filter(FilterFieldOperator.LESS_THAN, field, value);

describe('collectRootFilterValues', () => {
    it('collects positive equality leaves under AND', () => {
        const result = collectRootFilterValues(query(and(eq('analysis_id', 'X'), eq('level', 'info'))));
        expect(result).toEqual({ analysis_id: 'X', level: 'info' });
    });

    it('walks nested AND groups', () => {
        const result = collectRootFilterValues(query(and(eq('analysis_id', 'X'), and(eq('node_id', 'N')))));
        expect(result).toEqual({ analysis_id: 'X', node_id: 'N' });
    });

    it('rejects a negated (ne) leaf instead of forwarding the inverse equality', () => {
        // `not(eq(analysis_id, X))` folds to a `ne` leaf at parse time; the old
        // code returned { analysis_id: 'X' }, i.e. logs FOR X — the inverse.
        expect(() => collectRootFilterValues(query(and(ne('analysis_id', 'X'))))).toThrow(BadRequestError);
    });

    it('rejects an OR compound instead of last-wins flattening', () => {
        // The old code walked both branches and returned { analysis_id: 'B' }.
        expect(() => collectRootFilterValues(query(or(eq('analysis_id', 'A'), eq('analysis_id', 'B'))))).toThrow(BadRequestError);
    });

    it('rejects a comparison (lt) leaf', () => {
        expect(() => collectRootFilterValues(query(and(lt('created_at', '5'))))).toThrow(BadRequestError);
    });

    it('returns an empty map for a query without a filters group', () => {
        expect(collectRootFilterValues(new Query({}))).toEqual({});
    });
});
