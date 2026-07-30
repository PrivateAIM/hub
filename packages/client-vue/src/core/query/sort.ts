/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from 'smob';
import type { SortsBuildInput } from '@rapiq/core';
import { SortDirection } from '@rapiq/core';

type Data = {
    createdAt?: string | Date,
    updatedAt?: string | Date,
    [key: string]: any
};
export function isQuerySortedDescByDate<T extends Data>(input: SortsBuildInput<T>) : boolean {
    if (Array.isArray(input)) {
        return input.some((el) => isQuerySortedDescByDate(el as SortsBuildInput<T>));
    }

    if (isObject(input)) {
        return input.createdAt === SortDirection.DESC ||
            input.updatedAt === SortDirection.DESC;
    }

    return typeof input === 'string' &&
        (input === '-createdAt' || input === '-updatedAt');
}
