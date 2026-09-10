/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { injectHydrationStore, isServerRuntime } from '@authup/client-web-kit';
import { pickEntityAPI } from '@privateaim/core-http-kit';
import type { DomainTypeMap } from '@privateaim/core-kit';
import {
    VCList,
    VCListBody,
    VCListEmpty,
    VCListItem,
    VCListLoading,
} from '@vuecs/list';
import { VCIcon } from '@vuecs/icon';
import type { FiltersBuildInput, QueryBuildInput, SortsBuildInput } from '@rapiq/core';
import type { Ref, VNodeArrayChildren, VNodeChild } from 'vue';
import {
    Fragment,
    computed,
    h,
    isRef,
    onServerPrefetch,
    ref,
    unref,
    useId,
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
    ListHydrationSnapshot,
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

type Entity<T> = T;

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

    // `context.type` spans every DomainTypeMap key, including the ones the core
    // client has no entity API for (the two log types and the four sub-types),
    // so this resolves to undefined for those and the list stays inert.
    const domainAPI = pickEntityAPI<Entity<RECORD>>(client, context.type);

    // The bucket the host backs with its hydration payload — provided by
    // `@authup/client-web-nuxt`'s plugin, which runs before hub's own. Must be
    // resolved synchronously here: `inject` outside setup silently yields
    // undefined, which is indistinguishable from "the host provides none".
    const hydrationStore = injectHydrationStore();

    // Request identity for the initial load, agreed on by both sides of the SSR
    // boundary. `useId` is stable across the server render and the hydrating
    // client for the same position in the component tree, so nothing has to be
    // derived from the query — which is what makes the handoff immune to filter
    // insertion order, to a `query` prop assembled from store state that is not
    // populated yet on one side, and to two lists of one entity type sharing a
    // query on one page. The entity type is in the key only to bound the blast
    // radius of an entry that is recorded but never adopted.
    const hydrationKey = `flame:list:${context.type}:${useId()}`;

    // Whether a load ran to completion. The initial server-side load records its
    // result for the client, and an adopted snapshot suppresses the client's own
    // load — so recording anything a *failed* load left behind would strand the
    // list on it with no retry.
    let loaded = false;

    let query : QueryBuildInput<Entity<RECORD>> | undefined;

    let queued : ListMeta<RECORD> | null = null;

    async function load(input: ListMeta<RECORD> = {}) {
        if (typeof domainAPI?.getMany !== 'function') return;

        // Coalesce concurrent calls: a plain early return here silently
        // dropped a load requested while another was in flight (e.g. an
        // inbox segment switched during the initial request — the stale
        // response landed and the selected segment never loaded). Keep
        // only the LATEST input; the queued run re-reads `props.query`
        // when it executes, so it carries the freshest filters.
        if (busy.value) {
            queued = input;
            return;
        }

        busy.value = true;
        meta.value.busy = true;

        // Drained in the finally block: the queued input must survive a
        // FAILED run too — draining only after the try/finally stranded it
        // on rejection (the switched segment never loaded) and replayed the
        // stale input on the NEXT unrelated load, overwriting its result.
        let drained = false;

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
                nextQuery as QueryBuildInput<Entity<RECORD>>,
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

            loaded = true;
        } finally {
            busy.value = false;
            meta.value.busy = false;

            // A load requested while this one ran supersedes the loadAll
            // continuation and onLoaded — it represents newer input.
            if (queued) {
                const next = queued;
                queued = null;
                drained = true;
                await load(next);
            }
        }

        if (drained) {
            return;
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
            const renderLoadingBand = (overlay: boolean) => {
                if (options.loading === false) return null;
                const slot = slots[EntityListSlotName.LOADING];
                // The slot is the FIRST-PAINT skeleton: it stands in
                // for the empty body while the initial load runs.
                // Refresh-with-data keeps the default spinner overlay
                // — a skeleton appended BELOW live rows would read as
                // phantom items.
                if (slot && !overlay) return slot(undefined);
                if (loadingOpt?.content) {
                    return h(loadingOpt.tag ?? 'div', { class: 'vc-list-loading' }, loadingOpt.content);
                }
                return h(VCListLoading, { overlay });
            };

            const bodySlot = slots[EntityListSlotName.BODY];
            if (bodySlot) {
                children.push(bodySlot(slotProps()));
            } else {
                // First-load band: <VCListBody> emits ONLY when
                // `data.length > 0` (its render condition is data presence),
                // so a band returned from its children while the list is
                // still empty is silently dropped — it must be a SIBLING
                // of the body. The wrapper class lets layout variants
                // (`.entity-grid`) apply the body's layout to the band, so
                // skeletons stand in the same grid as the rows they mimic.
                if (busy.value && data.value.length === 0) {
                    const band = renderLoadingBand(false);
                    if (band) children.push(h('div', { class: 'vc-list-loading-band' }, [band]));
                }

                children.push(h(VCListBody, {}, () => {
                    if (data.value.length === 0) {
                        // The `noMore` chrome below renders for exactly this
                        // state (`!busy && total === 0`) — suppress the default
                        // empty marker when it will, so the empty list shows
                        // one message, not two stacked ones.
                        const noMoreVisible = options.noMore !== false &&
                            total.value === 0 &&
                            (!!slots[EntityListSlotName.NO_MORE] || !!noMoreOpt?.content);
                        if (noMoreVisible) {
                            return null;
                        }
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

                            // Content callbacks receive the sections and may
                            // place the actions block inside their own layout
                            // (FProjects, FProjectNodes, FAnalysisNodes) — or
                            // ignore it entirely (FAnalyses). The getter records
                            // which happened, so the auto-append below only
                            // fires when the callback did NOT consume it;
                            // appending unconditionally rendered the block
                            // twice per row.
                            let actionsConsumed = false;
                            const sections: ListItemContentSections = {
                                slot: itemSlot ? itemSlot(itemSlotProps) : undefined,
                                get actions() {
                                    actionsConsumed = true;
                                    return actionsNode;
                                },
                                // Opt-in row marker (`item: { icon: true }`) —
                                // the old list engine's default item icon,
                                // consumed by custom content callbacks
                                // (FAnalysisNodes, FProjectNodes).
                                icon: itemOpt?.icon ?
                                    h(VCIcon, { name: 'fa6-solid:bars', class: 'me-1' }) :
                                    undefined,
                            };

                            let body: VNodeChild;
                            if (itemSlot) {
                                body = sections.slot;
                            } else if (itemOpt?.content) {
                                body = typeof itemOpt.content === 'function' ?
                                    itemOpt.content(item, itemSlotProps, sections) :
                                    itemOpt.content;
                            } else {
                                const textPropName = itemOpt?.textPropName ?? 'name';
                                body = h('span', String((item as any)[textPropName] ?? (item as any).id ?? ''));
                            }

                            if (!actionsNode || actionsConsumed) {
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
        setupInitialLoad();
    }

    function setupInitialLoad() {
        // Registered on BOTH sides, and that asymmetry would be a real bug.
        // A non-empty `instance.sp` is what makes Vue call `markAsyncBoundary()`
        // after setup, which hands the component's subtree a FRESH `useId`
        // counter. Registering only on the server would mark the boundary only
        // on the server, and every `useId()` drawn after this list — a nested
        // list's own hydration key included — would shift between the two
        // renders. The hook body never runs on the client: `@vue/server-renderer`
        // is the only thing that ever invokes `sp`.
        onServerPrefetch(async () => {
            // Without a bucket the response could not reach the browser, so the
            // server render must not pay for the request — and must not render
            // rows the hydrating client has no way to reproduce.
            if (!hydrationStore) {
                return;
            }

            // Awaiting here is what makes the renderer WAIT: the detached
            // microtask this replaces resolved after the HTML had already been
            // flushed, so the server paid for the request and still shipped an
            // empty list.
            try {
                await load();
            } catch {
                // Vue's renderer already swallows a rejecting prefetch. This
                // catch exists only to keep a failed load from being recorded.
                return;
            }

            // A load that never reached the response — coalesced away behind an
            // in-flight one, or an entity type with no `getMany` — fetched
            // nothing, and an empty snapshot strands the client with no retry.
            if (!loaded) {
                return;
            }

            // ponytail: one JSON round-trip is both the snapshot (the refs keep
            // mutating after this) and the serializability guarantee — a
            // non-POJO on `meta` degrades to a plain object instead of making
            // the host's payload serializer throw on the whole response. Swap
            // for a structured clone if a recorded value ever needs to survive
            // as something other than JSON.
            hydrationStore.set(hydrationKey, JSON.parse(JSON.stringify({
                data: data.value,
                total: total.value,
                meta: meta.value,
                query,
            })));
        });

        if (isServerRuntime()) {
            return;
        }

        if (hydrationStore) {
            const snapshot = hydrationStore.get<ListHydrationSnapshot<RECORD>>(hydrationKey);
            if (snapshot) {
                // Consumed on read: unlike a translation, a collection goes
                // stale, and the entry must not seed a later client-side
                // navigation back to this route.
                hydrationStore.delete(hydrationKey);

                data.value = snapshot.data;
                total.value = snapshot.total;
                meta.value = snapshot.meta;

                // `query` is assigned nowhere but inside `load()`, which this
                // path skips — and the socket handler reads it to decide whether
                // a newly created entity belongs at the TOP of a full first
                // page. Leaving it undefined silently stops realtime inserts on
                // every hydrated list until the user pages or searches.
                query = snapshot.query;

                // Fires exactly once on both paths, so a hydrated list and a
                // loaded one agree on this published hook.
                if (context.onLoaded) {
                    context.onLoaded(meta.value);
                }

                return;
            }
        }

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

            // `sorts` is rapiq's canonical spelling since 2.1.0; `sort` is
            // the deprecated alias it still accepts on QueryBuildInput. Read
            // both — dropping the alias would silently stop prepending for a
            // consumer that still spells it the old way. Matched on a DEFINED
            // value, not key presence: the documented migration wrapper
            // `{ sorts: props.sorts, sort: props.sort }` carries both keys
            // with an undefined value.
            const querySorts = query && (
                typeof query.sorts !== 'undefined' ? query.sorts : query.sort
            );

            const isSorted = typeof querySorts !== 'undefined' &&
                // query is build input here, so this is always the build-input
                // form (not an already-assembled ISorts node).
                isQuerySortedDescByDate(querySorts as SortsBuildInput<RECORD>) &&
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
