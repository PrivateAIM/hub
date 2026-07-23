/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { FieldsBuildInput, FiltersBuildInput, QueryBuildInput } from '@rapiq/core';
import { unref } from 'vue';
import type { PropType } from 'vue';
import type {
    EntityManager,
    EntityManagerEventsType,
    EntityManagerSlotProps,
} from './type';

export function buildEntityManagerSlotProps<T extends Record<string, any>>(
    input: EntityManager<T>,
) : EntityManagerSlotProps<T> {
    return {
        ...input,
        error: unref(input.error),
        busy: unref(input.busy),
        data: unref(input.data),
        lockId: unref(input.lockId),
    };
}

export function defineEntityManagerEvents<T>(): EntityManagerEventsType<T> {
    return {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        failed: (_item: Error) => true,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        created: (_item: T) => true,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        deleted: (_item: T) => true,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        updated: (_item: T) => true,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        resolved: (_item?: T) => true,
    };
}

export function defineEntityManagerProps<T extends Record<string, any>>() {
    return {
        entity: { type: Object as PropType<T> },
        entityId: { type: String },
        queryFilters: { type: Object as PropType<FiltersBuildInput<T, 3>> },
        queryFields: { type: Object as PropType<FieldsBuildInput<T, 3>> },
        query: { type: Object as PropType<QueryBuildInput<T, 3>> },
    };
}
