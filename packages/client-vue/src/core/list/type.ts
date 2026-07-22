/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteralKeys } from '@privateaim/kit';
import type {
    FieldsBuildInput,
    FiltersBuildInput,
    PaginationBuildInput,
    Parameter,
    QueryBuildInput,
    RelationsBuildInput,
    SortsBuildInput,
} from '@rapiq/core';
import type {
    MaybeRef,
    Ref,
    SetupContext,
    VNodeChild,
} from 'vue';
import type { EntitySocketContext } from '../entity-socket';
import type { EntityListSlotName } from './constants';

type Entity<T> = T;

// All rapiq build-input surfaces are depth-bounded to 3 (matching
// @authup/client-web-kit's QueryInput family). The library default (depth 5)
// expands over hub's cyclic entity graph (analysis ↔ project ↔ node) into a
// type too large for vue-tsc to serialize into the emitted .d.ts (TS7056).
// UI queries never address more than three relation segments.
export type ListMeta<T> = ObjectLiteralKeys<{
    total?: number,
    busy?: boolean,
    [Parameter.PAGINATION]?: PaginationBuildInput,
    [Parameter.FILTERS]?: FiltersBuildInput<T, 3>,
    [Parameter.SORT]?: SortsBuildInput<T, 3>,
    [Parameter.FIELDS]?: FieldsBuildInput<T, 3>,
    [Parameter.RELATIONS]?: RelationsBuildInput<T, 3>
}>;

export type ListLoadFn<M = any> = (meta?: M) => Promise<void>;

export type ListSlotProps<T, M = any> = {
    data: T[];
    busy: boolean;
    total: number;
    load: ListLoadFn<M>;
    meta: M;
    created(item: T): void;
    updated(item: T): void;
    deleted(item: T): void;
};

export type ListBodySlotProps<T, M = any> = ListSlotProps<T, M>;
export type ListHeaderSlotProps<T, M = any> = ListSlotProps<T, M>;
export type ListFooterSlotProps<T, M = any> = ListSlotProps<T, M>;
export type ListItemSlotProps<T> = {
    data: T;
    index: number;
    busy: boolean;
    updated(item: T): void;
    deleted(item: T): void;
    failed(error: Error): void;
};

export type ListItemContentSections = {
    slot?: VNodeChild,
    actions?: VNodeChild,
    icon?: VNodeChild
};

export type ListHeaderOptions<T> = {
    content?: VNodeChild | (() => VNodeChild),
    tag?: string,
    /** @internal phantom field — keeps `T` referenced for eslint while preserving the public generic surface. */
    _typeWitness?: (row: T) => void,
};
export type ListFooterOptions<T> = ListHeaderOptions<T>;
export type ListNoMoreOptions<T> = ListHeaderOptions<T>;
export type ListLoadingOptions<T> = ListHeaderOptions<T>;
export type ListItemOptions<T> = {
    content?: VNodeChild | ((item: T, props: ListItemSlotProps<T>, sections: ListItemContentSections) => VNodeChild),
    tag?: string,
    textPropName?: string,
    icon?: boolean
};

export type ListBodyOptions<T> = {
    data?: T[],
    tag?: string,
    item?: ListItemOptions<T>
};

export type ListRenderOptions<T> = {
    header?: ListHeaderOptions<T> | boolean,
    body?: ListBodyOptions<T>,
    item?: ListItemOptions<T>,
    noMore?: ListNoMoreOptions<T> | boolean,
    footer?: ListFooterOptions<T> | boolean,
    loading?: ListLoadingOptions<T> | boolean
};

export type ListProps<T> = {
    realmId?: string,
    query?: QueryBuildInput<Entity<T>, 3>,
    loadOnSetup?: boolean,
} & ListRenderOptions<T>;

export type List<T> = {
    render() : VNodeChild;
    load: ListLoadFn<ListMeta<T>>,
    handleCreated(item: T) : void;
    handleDeleted(item: T) : void;
    handleUpdated(item: T) : void;
    setDefaults(defaults: ListRenderOptions<T>) : void,
    data: Ref<T[]>,
    busy: Ref<boolean>,
    meta: Ref<ListMeta<T>>,
    total: Ref<number>,
};

export type ListSlotsType<T> = ObjectLiteralKeys<{
    [EntityListSlotName.BODY]: ListBodySlotProps<T, ListMeta<T>>,
    [EntityListSlotName.DEFAULT]: ListSlotProps<T, ListMeta<T>>,
    [EntityListSlotName.ITEM]: ListItemSlotProps<T>, // todo: add generic
    [EntityListSlotName.ITEM_ACTIONS]: ListItemSlotProps<T>, // todo: add generic
    [EntityListSlotName.ITEM_ACTIONS_EXTRA]: ListItemSlotProps<T>, // todo: add generic
    [EntityListSlotName.HEADER]: ListHeaderSlotProps<T, ListMeta<T>>,
    [EntityListSlotName.FOOTER]: ListFooterSlotProps<T, ListMeta<T>>,
    [EntityListSlotName.NO_MORE]: undefined,
    [EntityListSlotName.LOADING]: undefined
}>;

export type ListEventsType<T> = {
    created: (item: T) => true,
    deleted: (item: T) => true,
    updated: (item: T) => true
};

export type ListCreateContext<
    TYPE extends string,
    RECORD extends Record<string, any>,
> = {
    type: TYPE,
    realmId?: MaybeRef<string>,
    setup: SetupContext<ListEventsType<RECORD>>,
    props: ListProps<RECORD>,
    loadAll?: boolean,
    query?: QueryBuildInput<Entity<RECORD>, 3> | (() => QueryBuildInput<Entity<RECORD>, 3>),
    queryFilters?: ((data: FiltersBuildInput<Entity<RECORD>, 3>) => void),
    onCreated?: (entity: RECORD, meta: ListMeta<RECORD>) => void | Promise<void>,
    onLoaded?: (meta: ListMeta<RECORD>) => void | Promise<void>,
    socket?: boolean | Omit<EntitySocketContext<TYPE, RECORD>, 'type'>
};
