/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@privateaim/errors';
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
import { collectRootFilterValues } from '../../../src/index.ts';

// The log controllers (server-core's analysis-log proxies, server-telemetry's
// own /logs) forward the collected values as label
// equalities to the telemetry read/delete endpoints. The rapiq v2 expression
// dialect can express negation/comparison/OR (which the schema allow-list does
// not constrain — it only constrains field names), so a crafted filter must be
// rejected rather than silently flattened to a bare (inverse) equality.
const query = (filters: Filters) => new Query({ filters });
const and = (...conditions: ICondition[]) => new Filters(FilterCompoundOperator.AND, conditions);
const or = (...conditions: ICondition[]) => new Filters(FilterCompoundOperator.OR, conditions);
const eq = (field: string, value: string) => new Filter(FilterFieldOperator.EQUAL, field, value);
const ne = (field: string, value: string) => new Filter(FilterFieldOperator.NOT_EQUAL, field, value);

describe('collectRootFilterValues', () => {
    it('collects positive equality leaves under AND', () => {
        const result = collectRootFilterValues(query(and(eq('analysisId', 'X'), eq('level', 'info'))));
        expect(result).toEqual({ analysisId: 'X', level: 'info' });
    });

    it('walks nested AND groups', () => {
        const result = collectRootFilterValues(query(and(eq('analysisId', 'X'), and(eq('nodeId', 'N')))));
        expect(result).toEqual({ analysisId: 'X', nodeId: 'N' });
    });

    it('rejects a negated (ne) leaf instead of forwarding the inverse equality', () => {
        // `not(eq(analysisId, X))` folds to a `ne` leaf at parse time; the old
        // code returned { analysisId: 'X' }, i.e. logs FOR X — the inverse.
        expect(() => collectRootFilterValues(query(and(ne('analysisId', 'X'))))).toThrow(BadRequestError);
    });

    it('rejects an OR compound instead of last-wins flattening', () => {
        // The old code walked both branches and returned { analysisId: 'B' }.
        expect(() => collectRootFilterValues(query(or(eq('analysisId', 'A'), eq('analysisId', 'B'))))).toThrow(BadRequestError);
    });

    it('rejects the same field twice instead of last-wins flattening', () => {
        // and(eq(refId,A), eq(refId,B)) matches nothing (A∧B is empty); the old
        // code flattened it to { refId: 'B' } and deleted B's logs.
        expect(() => collectRootFilterValues(query(and(eq('refId', 'A'), eq('refId', 'B'))))).toThrow(BadRequestError);
        expect(() => collectRootFilterValues(query(and(eq('refId', 'A'), and(eq('refId', 'B')))))).toThrow(BadRequestError);
    });

    it('returns an empty map for a query without a filters group', () => {
        expect(collectRootFilterValues(new Query({}))).toEqual({});
    });
});
