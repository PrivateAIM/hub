/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { compileFilters } from '@rapiq/adapter-memory';
import type { FiltersBuildInput, ICondition } from '@rapiq/core';
import { and, defineFilters, isCondition } from '@rapiq/core';
import { createMerger } from 'smob';

type FiltersInput = FiltersBuildInput<Record<string, any>, 3> | ICondition;

// The list's query merger: deep, `incoming` wins on a shared key.
const merger = createMerger({
    array: false,
    inPlace: false,
    priority: 'left',
});

function isEmptyFilters(input: FiltersInput) : boolean {
    return !isCondition(input) && Object.keys(input).length === 0;
}

/**
 * Combine a page's filters with the ones a load was called with (e.g. a
 * search). `FSearch` emits an expression (`or(contains(…))`), and an object
 * merge of an expression with a field bag silently drops the bag: rapiq
 * encodes only the expression, so a project-scoped list searched across
 * every project. Two field bags deep-merge as before (`incoming` wins on a
 * shared key); otherwise the two are combined with `and()`.
 */
export function combineFilters(
    page: FiltersInput | undefined,
    incoming: FiltersInput | undefined,
) : FiltersInput | undefined {
    if (!page || isEmptyFilters(page)) {
        return incoming;
    }

    if (!incoming || isEmptyFilters(incoming)) {
        return page;
    }

    if (!isCondition(page) && !isCondition(incoming)) {
        return merger({}, incoming, page);
    }

    const toCondition = (input: FiltersInput) => (isCondition(input) ? input : defineFilters(input));

    return and(toCondition(page), toCondition(incoming));
}

/**
 * Whether a record pushed by realtime satisfies the filters a list loaded
 * with. Evaluated with rapiq's memory adapter, so every filter form the HTTP
 * query accepts is honored. A relation filter fails, because event payloads
 * carry no relations; the list then skips the record, which a reload shows.
 * Unparseable filters (e.g. an expression after the SSR JSON round-trip)
 * fail too.
 */
export function matchesQueryFilters(
    record: Record<string, any>,
    filters: FiltersInput | undefined,
) : boolean {
    if (!filters || isEmptyFilters(filters)) {
        return true;
    }

    try {
        return compileFilters(defineFilters(filters))(record);
    } catch {
        return false;
    }
}
