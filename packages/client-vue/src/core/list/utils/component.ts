/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { QueryBuildInput } from '@rapiq/core';
import type { PropType } from 'vue';
import type {
    ListBodyOptions,
    ListEventsType, 
    ListFooterOptions, 
    ListHeaderOptions, 
    ListLoadingOptions, 
    ListNoMoreOptions,
} from '../type';

export function defineListEvents<T>() : ListEventsType<T> {
    return {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        created: (_item: T) => true,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        deleted: (_item: T) => true,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        updated: (_item: T) => true,
    };
}
export function defineListProps<T extends Record<string, any>>() {
    return {
        query: {
            // Depth-bounded to 3 (matching @authup/client-web-kit's
            // EntityListQueryInput): the library default (depth 5) expands
            // QueryBuildInput over hub's cyclic entity graph
            // (analysis ↔ project ↔ node) into a type too large for vue-tsc
            // to serialize into the emitted .d.ts (TS7056). UI queries never
            // address more than three relation segments.
            type: Object as PropType<QueryBuildInput<T, 3>>,
            default() {
                return {};
            },
        },
        realmId: {
            type: String,
            default: undefined,
        },
        loadOnSetup: {
            type: Boolean,
            default: true,
        },
        loading: {
            type: [Boolean, Object] as PropType<boolean | ListLoadingOptions<T>>,
            default: true,
        },
        noMore: {
            type: [Boolean, Object] as PropType<boolean | ListNoMoreOptions<T>>,
            default: true,
        },
        footer: {
            type: [Boolean, Object] as PropType<boolean | ListFooterOptions<T>>,
            default: true,
        },
        header: {
            type: [Boolean, Object] as PropType<boolean | ListHeaderOptions<T>>,
            default: true,
        },
        body: { type: Object as PropType<ListBodyOptions<T>> },
    };
}
