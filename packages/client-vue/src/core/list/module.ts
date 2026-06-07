/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasOwnProperty } from '@privateaim/kit';
import type { EntityAPI } from '@authup/core-http-kit';
import type { DomainTypeMap } from '@privateaim/core-kit';
import {
    VCList,
    VCListBody,
    VCListEmpty,
    VCListItem,
    VCListLoading,
} from '@vuecs/list';
import type { BuildInput, FiltersBuildInput } from 'rapiq';
import type { Ref, VNodeArrayChildren, VNodeChild } from 'vue';
import {
    Fragment,
    computed,
    h,
    isRef,
    ref,
    unref,
} from 'vue';
import { createMerger, isObject } from 'smob';
import { boolableToObject } from '../../utils';
import { injectCoreHTTPClient } from '../http-client';
import { createEntitySocket } from '../entity-socket';
import type { EntitySocketContext } from '../entity-socket';
import { isQuerySortedDescByDate } from '../query';
import { EntityListSlotName } from './constants';
import type {
    List,
    ListCreateContext,
    ListFooterOptions,
    ListHeaderOptions,
    ListItemContentSections,
    ListItemSlotProps,
    ListLoadingOptions,
    ListMeta,
    ListNoMoreOptions,
    ListRenderOptions,
    ListSlotProps,
} from './type';
import {
    ListHandlers,
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
    const meta = ref({ pagination: { limit: 10 } }) as Ref<ListMeta<RECORD>>;

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

    const handlers = new ListHandlers<RECORD>(data, {
        created: (cbEntity) => {
            total.value++;

            if (context.onCreated) {
                context.onCreated(cbEntity, meta.value);
            }

            if (context.setup && typeof context.setup.emit === 'function') {
                context.setup.emit('created', cbEntity);
            }
        },
        deleted: (cbEntity) => {
            total.value--;

            if (context.setup && typeof context.setup.emit === 'function') {
                context.setup.emit('deleted', cbEntity);
            }
        },
        updated: (cbEntity) => {
            if (context.setup && typeof context.setup.emit === 'function') {
                context.setup.emit('updated', cbEntity);
            }
        },
    });

    let options : ListRenderOptions<RECORD> = context.props;

    const setDefaults = (defaults: ListRenderOptions<RECORD>) => {
        options = mergeListOptions(context.props, defaults);
    };

    function render() : VNodeChild {
        const headerOpt: ListHeaderOptions<RECORD> | undefined = boolableToObject(options.header || {});
        const footerOpt: ListFooterOptions<RECORD> | undefined = boolableToObject(options.footer || {});
        const noMoreOpt: ListNoMoreOptions<RECORD> | undefined = boolableToObject(options.noMore || {});
        const loadingOpt: ListLoadingOptions<RECORD> | undefined = boolableToObject(options.loading || {});

        const itemOpt = options.item ||
            (options.body && typeof options.body === 'object' ?
                options.body.item :
                undefined);

        const slots = context.setup.slots || {};

        // Each callback delegates to the `handlers` instance which already
        // updates total/data and emits the corresponding parent event —
        // adding a parallel `context.setup.emit(...)` here would fire each
        // event twice (silent data-corruption risk on entity mutations).
        const slotProps = (): ListSlotProps<RECORD, ListMeta<RECORD>> => ({
            data: data.value,
            busy: busy.value,
            total: total.value,
            load,
            meta: meta.value,
            created: (value: RECORD) => handlers.created(value),
            updated: (value: RECORD) => handlers.updated(value),
            deleted: (value: RECORD) => handlers.deleted(value),
        });

        const renderChrome = (
            slotName: EntityListSlotName,
            opt: ListHeaderOptions<RECORD> | undefined,
            cssClass: string,
            withSlotProps = true,
        ): VNodeChild | null => {
            const slot = slots[slotName];
            if (slot) {
                return h(
                    opt?.tag ?? 'div',
                    { class: cssClass },
                    withSlotProps ? slot(slotProps()) : slot(undefined),
                );
            }
            if (opt?.content) {
                const content: VNodeArrayChildren = [
                    typeof opt.content === 'function' ?
                        opt.content() :
                        opt.content,
                ];
                return h(opt.tag ?? 'div', { class: cssClass }, content);
            }
            return null;
        };

        // <VCList> must receive `:data` / `:busy` / `:total` (or `:state`)
        // — without them, the list context publishes an empty data ref,
        // and child <VCListBody> / <VCListEmpty> short-circuit
        // (return null) regardless of what slot vnodes the renderer
        // emits. Symptom: junction list views render the header + footer
        // but the body is silently dropped. See @vuecs/list source —
        // `useList()` reads from the parent VCList's provided state,
        // not from the children passed to VCListBody.
        const listProps = {
            data: data.value,
            busy: busy.value,
            total: total.value,
            meta: meta.value,
        };

        // DEFAULT slot — if provided, takes over the entire list contents
        // (legacy buildList contract). Used as the escape hatch for
        // consumers that want full control over the list body.
        const defaultSlot = slots[EntityListSlotName.DEFAULT];
        if (defaultSlot) {
            return h(VCList, listProps, () => defaultSlot(slotProps()));
        }

        return h(VCList, listProps, () => {
            const children: VNodeChild[] = [];

            const headerVNode = options.header !== false ?
                renderChrome(EntityListSlotName.HEADER, headerOpt, 'vc-list-header') :
                null;
            if (headerVNode) children.push(headerVNode);

            // BODY slot — if provided, the consumer renders the full body
            // (e.g. a `<VCTable>` with `:columns` driving auto-render) and
            // per-item rendering is skipped. Otherwise fall back to
            // <VCListBody> + per-item <VCListItem>.
            const bodySlot = slots[EntityListSlotName.BODY];
            if (bodySlot) {
                children.push(bodySlot(slotProps()));
            } else {
                children.push(h(VCListBody, {}, () => {
                    const renderLoadingBand = (overlay: boolean) => {
                        if (options.loading === false) return null;
                        const slot = slots[EntityListSlotName.LOADING];
                        if (slot) return slot(undefined);
                        if (loadingOpt?.content) {
                            return h(loadingOpt.tag ?? 'div', { class: 'vc-list-loading' }, loadingOpt.content);
                        }
                        return h(VCListLoading, { overlay });
                    };

                    // First-load: data is empty AND busy → show loading in place.
                    if (busy.value && data.value.length === 0) {
                        return renderLoadingBand(false);
                    }

                    if (data.value.length === 0) {
                        return h(VCListEmpty);
                    }

                    // Refresh path: data shown AND busy → overlay loading on top
                    // of existing rows so consumers still see refresh feedback.
                    const rows = data.value.map((item, index) => {
                        // Same single-emit contract as `slotProps()`: handlers
                        // already emits, so we delegate and don't double-fire.
                        const itemSlotProps: ListItemSlotProps<RECORD> = {
                            data: item,
                            index,
                            busy: busy.value,
                            updated: (next: RECORD) => handlers.updated(next),
                            deleted: (next: RECORD) => handlers.deleted(next),
                            failed: () => {},
                        };
                        return h(VCListItem, { key: (item as any).id ?? index }, () => {
                            const itemSlot = slots[EntityListSlotName.ITEM];
                            const itemActionsSlot = slots[EntityListSlotName.ITEM_ACTIONS];
                            const itemActionsExtraSlot = slots[EntityListSlotName.ITEM_ACTIONS_EXTRA];

                            const actionsNodes: VNodeChild[] = [];
                            if (itemActionsSlot) {
                                actionsNodes.push(itemActionsSlot(itemSlotProps));
                            }
                            if (itemActionsExtraSlot) {
                                actionsNodes.push(itemActionsExtraSlot(itemSlotProps));
                            }

                            const actionsNode = actionsNodes.length > 0 ?
                                h(
                                    'div',
                                    { class: 'vc-list-item-actions ms-auto flex items-center gap-1' },
                                    actionsNodes,
                                ) :
                                undefined;

                            const sections: ListItemContentSections = {
                                slot: itemSlot ? itemSlot(itemSlotProps) : undefined,
                                actions: actionsNode,
                            };

                            let body: VNodeChild;
                            if (itemSlot) {
                                body = sections.slot;
                            } else if (itemOpt?.content) {
                                body = typeof itemOpt.content === 'function' ?
                                    itemOpt.content(item, itemSlotProps, sections) :
                                    itemOpt.content;
                            } else {
                                body = h('span', String((item as any).name ?? (item as any).id ?? ''));
                            }

                            if (!actionsNode) {
                                return body;
                            }

                            return [
                                body,
                                actionsNode,
                            ];
                        });
                    });

                    if (busy.value) {
                        return [rows, renderLoadingBand(true)];
                    }
                    return rows;
                }));
            }

            // "No more" — empty-list indicator. Rendered ONLY when the list
            // is empty (`total === 0`) and not currently loading.
            if (
                options.noMore !== false &&
                !busy.value &&
                total.value === 0
            ) {
                const noMoreVNode = renderChrome(EntityListSlotName.NO_MORE, noMoreOpt, 'vc-list-no-more', false);
                if (noMoreVNode) children.push(noMoreVNode);
            }

            const footerVNode = options.footer !== false ?
                renderChrome(EntityListSlotName.FOOTER, footerOpt, 'vc-list-footer') :
                null;
            if (footerVNode) children.push(footerVNode);

            return h(Fragment, children);
        });
    }

    context.setup.expose({
        handleCreated: (data: RECORD) => handlers.created(data),
        handleDeleted: (data: RECORD) => handlers.deleted(data),
        handleUpdated: (data: RECORD) => handlers.updated(data),
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
            target: false,
        };

        socketContext.onCreated = (entity) => {
            const limit = meta.value?.pagination?.limit;
            if (typeof limit !== 'number') {
                handlers.created(entity);
                return;
            }

            if (total.value < limit) {
                handlers.created(entity);
                return;
            }

            const isSorted = query &&
                query.sort &&
                isQuerySortedDescByDate(query.sort) &&
                meta.value?.pagination?.offset === 0;

            if (isSorted) {
                handlers.created(entity);
            }
        };
        socketContext.onDeleted = (entity: RECORD) => {
            handlers.deleted(entity);
        };
        socketContext.onUpdated = (entity: RECORD) => {
            handlers.updated(entity);
        };
        socketContext.realmId = realmId;

        createEntitySocket(socketContext);
    }

    return {
        data,
        busy,
        meta,
        total,

        handleCreated: (entity: RECORD) => {
            handlers.updated(entity);
        },
        handleDeleted: (entity: RECORD) => {
            handlers.deleted(entity);
        },
        handleUpdated: (entity: RECORD) => {
            handlers.updated(entity);
        },

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
