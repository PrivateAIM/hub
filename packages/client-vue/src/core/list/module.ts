/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasOwnProperty } from '@privateaim/kit';
import type { DomainAPI } from '@authup/core-http-kit';
import type { DomainEntity, DomainType } from '@privateaim/core-kit';
import type {
    ListFooterBuildOptionsInput, ListHeaderBuildOptionsInput,
} from '@vuecs/list-controls';
import {
    buildList,
} from '@vuecs/list-controls';
import type { BuildInput, FiltersBuildInput } from 'rapiq';
import type { Ref, VNodeChild } from 'vue';
import {
    computed, isRef,
    ref, unref,
} from 'vue';
import { createMerger, isObject } from 'smob';
import { boolableToObject } from '../../utils';
import { injectCoreHTTPClient } from '../http-client';
import { createEntitySocket } from '../entity-socket';
import type { EntitySocketContext } from '../entity-socket';
import { isQuerySortedDescByDate } from '../query';
import type {
    List,
    ListCreateContext,
    ListMeta,
    ListRenderOptions,
} from './type';
import {
    buildListCreatedHandler,
    buildListDeletedHandler,
    buildListUpdatedHandler,
    mergeListOptions,
} from './utils';

type Entity<T> = T extends Record<string, any> ? T : never;
type DomainTypeInfer<T> = T extends DomainEntity<infer U> ? U extends `${DomainType}` ? U : never : never;

const merger = createMerger({
    array: false,
    inPlace: false,
    priority: 'left',
});

export function createList<
    A extends DomainTypeInfer<DomainEntity<any>>,
    T = DomainEntity<A>,
>(
    context: ListCreateContext<A, T>,
) : List<T> {
    const data : Ref<T[]> = ref([]);
    const busy = ref(false);
    const total = ref(0);
    const meta = ref({
        pagination: {
            limit: 10,
        },
    }) as Ref<ListMeta<T>>;

    const realmId = computed<string | undefined>(
        () => {
            if (context.realmId) {
                return isRef(context.realmId) ? context.realmId.value : context.realmId;
            }

            if (context.props.realmId) {
                return context.props.realmId;
            }

            return undefined;
        },
    );

    const client = injectCoreHTTPClient();

    let domainAPI : DomainAPI<Entity<T>> | undefined;
    if (hasOwnProperty(client, context.type)) {
        domainAPI = client[context.type] as any;
    }

    let query : BuildInput<Entity<T>> | undefined;

    async function load(input: ListMeta<T> = {}) {
        if (!domainAPI || busy.value) return;

        busy.value = true;
        meta.value.busy = true;

        try {
            let filters : FiltersBuildInput<Entity<T>> | undefined;
            if (
                context.queryFilters &&
                input.filters &&
                hasOwnProperty(input.filters, 'name') &&
                typeof input.filters.name === 'string'
            ) {
                // todo: queryFilters should customize full filters object!
                filters = context.queryFilters(input.filters.name) as FiltersBuildInput<Entity<T>>;
            }

            query = undefined;
            if (context.query) {
                if (typeof context.query === 'function') {
                    query = context.query();
                } else {
                    query = context.query;
                }
            }

            if (context.props.query) {
                if (query) {
                    query = merger({}, context.props.query, query);
                } else {
                    query = context.props.query;
                }
            }

            const nextQuery : ListMeta<T> = merger(
                (filters ? { filters } : {}),
                input || {},
                {
                    pagination: {
                        limit: meta.value.pagination?.limit,
                        offset: meta.value.pagination?.offset,
                    },
                },
                query || {},
            );

            const response = await domainAPI.getMany(
                nextQuery as BuildInput<Entity<T>>,
            );

            meta.value = nextQuery;

            if (context.loadAll) {
                data.value.push(...response.data as T[]);
            } else {
                data.value = response.data as T[];
            }

            total.value = response.meta.total;

            meta.value.total = response.meta.total;
            meta.value.pagination = {
                limit: response.meta.limit,
                offset: response.meta.offset,
            };
        } finally {
            busy.value = false;
            meta.value.busy = false;
        }

        if (
            context.loadAll &&
            total.value > data.value.length
        ) {
            await load({
                ...meta.value,
                pagination: {
                    ...meta.value.pagination,
                    offset: (meta.value.pagination?.offset ?? 0) + (meta.value.pagination?.limit ?? 0),
                },
            });
        }
    }

    const handleCreated = buildListCreatedHandler(data, (cbEntity) => {
        total.value--;

        if (context.onCreated) {
            context.onCreated(cbEntity, meta.value);
        }
    });
    const handleDeleted = buildListDeletedHandler(data, () => {
        total.value--;
    });
    const handleUpdated = buildListUpdatedHandler(data);

    let options : ListRenderOptions<T> = context.props;

    const setDefaults = (defaults: ListRenderOptions<T>) => {
        options = mergeListOptions(context.props, defaults);
    };

    function render() : VNodeChild {
        const header : ListHeaderBuildOptionsInput<T> = boolableToObject(options.header || {});
        const footer : ListFooterBuildOptionsInput<T> = boolableToObject(options.footer || {});

        if (options.item) {
            if (
                typeof options.body === 'undefined' ||
                typeof options.body === 'boolean'
            ) {
                options.body = { item: options.item };
            } else {
                options.body.item = options.item;
            }
        }

        return buildList<T, ListMeta<T>>({
            footer,
            header,
            noMore: options.noMore,
            body: options.body,
            loading: options.loading,
            total: total.value,
            load,
            busy: busy.value,
            data: data.value as Entity<T>[],
            meta: {
                ...meta.value,
                total: total.value,
            },
            onCreated(value: T) {
                handleCreated(value);
            },
            onDeleted(value: T) {
                handleDeleted(value);
            },
            onUpdated: (value: T) => {
                handleUpdated(value);
            },
            slotItems: context.setup.slots || {},
        });
    }

    context.setup.expose({
        handleCreated,
        handleDeleted,
        handleUpdated,
        load,
        data,
    });

    let loadOnSetup = true;
    const propLoadOnSetup = unref(context.props.loadOnSetup);
    if (typeof propLoadOnSetup === 'boolean') {
        loadOnSetup = propLoadOnSetup;
    }

    if (loadOnSetup) {
        Promise.resolve()
            .then(() => load())
            .catch((e) => console.log(e));
    }

    if (
        typeof context.socket !== 'boolean' ||
        typeof context.socket === 'undefined' ||
        context.socket
    ) {
        const socketContext : EntitySocketContext<A, T> = {
            type: context.type,
            ...(isObject(context.socket) ? context.socket : {}),
        };

        socketContext.onCreated = (entity) => {
            const limit = meta.value?.pagination?.limit;
            if (typeof limit !== 'number') {
                handleCreated(entity);
                return;
            }

            if (total.value < limit) {
                handleCreated(entity);
                return;
            }

            const isSorted = query &&
                query.sort &&
                isQuerySortedDescByDate(query.sort) &&
                meta.value?.pagination?.offset === 0;

            if (isSorted) {
                handleCreated(entity);
            }
        };
        socketContext.onDeleted = (entity: T) => {
            handleDeleted(entity);
        };
        socketContext.onUpdated = (entity: T) => {
            handleDeleted(entity);
        };
        socketContext.realmId = realmId;

        createEntitySocket(socketContext);
    }

    return {
        data,
        busy,
        meta,
        total,

        handleCreated,
        handleUpdated,
        handleDeleted,

        render,
        load,
        setDefaults,
    };
}
