/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasOwnProperty } from '@privateaim/kit';
import type { EntityAPI } from '@authup/core-http-kit';
import type { DomainTypeMap } from '@privateaim/core-kit';
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

const merger = createMerger({
    array: false,
    inPlace: false,
    priority: 'left',
});

export function createListRaw<
    TYPE extends keyof DomainTypeMap,
    RECORD extends DomainTypeMap[TYPE],
>(
    context: ListCreateContext<TYPE, RECORD>,
) : List<RECORD> {
    const data : Ref<RECORD[]> = ref([]);
    const busy = ref(false);
    const total = ref(0);
    const meta = ref({
        pagination: {
            limit: 10,
        },
    }) as Ref<ListMeta<RECORD>>;

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

    let domainAPI : EntityAPI<Entity<RECORD>> | undefined;
    if (hasOwnProperty(client, context.type)) {
        domainAPI = client[context.type] as any;
    }

    let query : BuildInput<Entity<RECORD>> | undefined;

    async function load(input: ListMeta<RECORD> = {}) {
        if (!domainAPI || busy.value) return;

        busy.value = true;
        meta.value.busy = true;

        try {
            if (context.queryFilters) {
                const filters = (input.filters || {}) as FiltersBuildInput<Entity<RECORD>>;
                context.queryFilters(filters);

                input.filters = filters;
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

            const nextQuery : ListMeta<RECORD> = merger(
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
                nextQuery as BuildInput<Entity<RECORD>>,
            );

            meta.value = nextQuery;

            if (context.loadAll) {
                data.value.push(...response.data as RECORD[]);
            } else {
                data.value = response.data as RECORD[];
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

        if (context.loadAll) {
            if (
                total.value > data.value.length
            ) {
                await load({
                    ...meta.value,
                    pagination: {
                        ...meta.value.pagination,
                        offset: (meta.value.pagination?.offset ?? 0) + (meta.value.pagination?.limit ?? 0),
                    },
                });

                return;
            }

            if (context.onLoaded) {
                context.onLoaded(meta.value);
            }

            return;
        }
        if (context.onLoaded) {
            context.onLoaded(meta.value);
        }
    }

    const handleCreated = buildListCreatedHandler(data, (cbEntity) => {
        total.value++;

        if (context.onCreated) {
            context.onCreated(cbEntity, meta.value);
        }

        if (context.setup && typeof context.setup.emit === 'function') {
            context.setup.emit('created', cbEntity);
        }
    });
    const handleDeleted = buildListDeletedHandler(data, (cbEntity) => {
        total.value--;

        if (context.setup && typeof context.setup.emit === 'function') {
            context.setup.emit('deleted', cbEntity);
        }
    });
    const handleUpdated = buildListUpdatedHandler(data, (cbEntity) => {
        if (context.setup && typeof context.setup.emit === 'function') {
            context.setup.emit('updated', cbEntity);
        }
    });

    let options : ListRenderOptions<RECORD> = context.props;

    const setDefaults = (defaults: ListRenderOptions<RECORD>) => {
        options = mergeListOptions(context.props, defaults);
    };

    function render() : VNodeChild {
        const header : ListHeaderBuildOptionsInput<RECORD> = boolableToObject(options.header || {});
        const footer : ListFooterBuildOptionsInput<RECORD> = boolableToObject(options.footer || {});

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

        return buildList<RECORD, ListMeta<RECORD>>({
            footer,
            header,
            noMore: options.noMore,
            body: options.body,
            loading: options.loading,
            total: total.value,
            load,
            busy: busy.value,
            data: data.value as Entity<RECORD>[],
            meta: {
                ...meta.value,
                total: total.value,
            },
            onCreated(value: RECORD) {
                handleCreated(value);
            },
            onDeleted(value: RECORD) {
                handleDeleted(value);
            },
            onUpdated: (value: RECORD) => {
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
        const socketContext : EntitySocketContext<TYPE, RECORD> = {
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
        socketContext.onDeleted = (entity: RECORD) => {
            handleDeleted(entity);
        };
        socketContext.onUpdated = (entity: RECORD) => {
            handleUpdated(entity);
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

export function createList<
    A extends keyof DomainTypeMap,
>(
    context: ListCreateContext<A, DomainTypeMap[A]>,
) : List<DomainTypeMap[A]> {
    return createListRaw(context);
}
