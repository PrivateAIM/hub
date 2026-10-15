/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    and,
    elemMatch,
    eq,
    gt,
    inArray,
    not,
    or,
} from '@rapiq/core';
import { describe, expect, it } from 'vitest';
import { prefixConditionFields } from '../../../../src/core/query/index.ts';

describe('prefixConditionFields', () => {
    it('should re-root every field of a nested tree', () => {
        const condition = or(and(eq('realmId', 'r'), not(inArray('projectId', ['p']))), eq('name', 'x'));

        expect(prefixConditionFields(condition, 'analysis')).toEqual(
            or(and(eq('analysis.realmId', 'r'), not(inArray('analysis.projectId', ['p']))), eq('analysis.name', 'x')),
        );
    });

    it('should keep an elemMatch interior relative to its element', () => {
        expect(prefixConditionFields(elemMatch('tags', gt('weight', 1)), 'analysis'))
            .toEqual(elemMatch('analysis.tags', gt('weight', 1)));
    });

    it('should leave a condition for the analysis itself untouched', () => {
        const condition = eq('realmId', 'r');

        expect(prefixConditionFields(condition, '')).toBe(condition);
    });
});
