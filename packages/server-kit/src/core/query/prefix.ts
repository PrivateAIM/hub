/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ICondition } from '@rapiq/core';
import {
    Filter,
    Filters,
    isFilter,
    isFilters,
} from '@rapiq/core';

/**
 * Re-root a condition compiled for one entity onto a relation of another:
 * `eq('realmId', r)` under `analysis` becomes `eq('analysis.realmId', r)`, so
 * a reach compiled against the analysis narrows the rows that belong to it.
 * An `elemMatch` interior stays relative to its element.
 */
export function prefixConditionFields(condition: ICondition, path: string): ICondition {
    if (!path) {
        return condition;
    }

    if (isFilters(condition)) {
        return new Filters(
            condition.operator,
            condition.value.map((child) => prefixConditionFields(child, path)),
            { preserved: condition.preserved },
        );
    }

    if (isFilter(condition)) {
        return new Filter(condition.operator, `${path}.${condition.field}`, condition.value, { preserved: condition.preserved });
    }

    return condition;
}
