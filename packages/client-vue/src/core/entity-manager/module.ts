/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasOwnProperty } from '@privateaim/kit';
import type { EntityAPI } from '@authup/core-http-kit';
import type {
    DomainEntityID, DomainTypeMap,
} from '@privateaim/core-kit';
import type { BuildInput } from 'rapiq';
import { isObject } from 'smob';
import type { Ref, VNodeChild } from 'vue';
import {
    computed, isRef, ref, toRef, watch,
} from 'vue';
import { injectCoreHTTPClient } from '../http-client';
import type { EntitySocket, EntitySocketContext } from '../entity-socket';
import { createEntitySocket } from '../entity-socket';
import { extendObjectProperties } from '../object';
import { hasNormalizedSlot, normalizeSlot } from '../slot';
import type {
    EntityManager, EntityManagerContext, EntityManagerRenderFn, EntityManagerResolveContext,
} from './type';
import { buildEntityManagerSlotProps } from './utils';

export function createEntityManager<
    TYPE extends keyof DomainTypeMap,
    RECORD extends DomainTypeMap[TYPE],
>(
    ctx: EntityManagerContext<TYPE, RECORD>,
) : EntityManager<RECORD> {
    const client = injectCoreHTTPClient();
    let domainAPI : EntityAPI<RECORD> | undefined;
    if (hasOwnProperty(client, ctx.type)) {
        domainAPI = client[ctx.type] as any;
    }

    const entity : Ref<RECORD | null> = ref(null);
    const entityId = computed<DomainEntityID<RECORD> | undefined>(
        () => (
            entity.value ? (entity.value as any).id : undefined),
    );

    const realmId = computed<string | undefined>(
        () => {
            let realmId : string | undefined;

            if (ctx.realmId) {
                if (typeof ctx.realmId === 'function') {
                    return ctx.realmId(entity.value);
                }

                realmId = isRef(ctx.realmId) ? ctx.realmId.value : ctx.realmId;
            }

            if (!realmId && entity.value) {
                if (
                    hasOwnProperty(entity.value, 'realm_id') &&
                    typeof entity.value.realm_id === 'string'
                ) {
                    return entity.value.realm_id;
                }
            }

            return realmId;
        },
    );

    const lockId = ref(undefined) as Ref<DomainEntityID<RECORD> | undefined>;

    if (ctx.props && ctx.props.entity) {
        entity.value = ctx.props.entity;
    }

    const created = (value: RECORD) => {
        if (ctx.setup && ctx.setup.emit) {
            ctx.setup.emit('created', value);
        }

        if (ctx.onCreated) {
            ctx.onCreated(value);
        }
    };

    const deleted = (value: RECORD) => {
        if (ctx.setup && ctx.setup.emit) {
            ctx.setup.emit('deleted', (value || entity.value) as RECORD);
        }

        if (ctx.onDeleted) {
            ctx.onDeleted((value || entity.value) as RECORD);
        }
    };

    const updated = (value: Partial<RECORD>) => {
        if (entity.value) {
            extendObjectProperties(entity.value, value);
        }

        if (ctx.setup && typeof ctx.setup.emit === 'function') {
            ctx.setup.emit('updated', (entity.value || value) as RECORD);
        }

        if (ctx.onUpdated) {
            ctx.onUpdated(entity.value || value);
        }
    };

    const resolved = (value: RECORD | null) => {
        if (ctx.setup && ctx.setup.emit) {
            ctx.setup.emit('resolved', value ? { ...value } : null);
        }

        if (ctx.onResolved) {
            ctx.onResolved(value ? { ...value } : null);
        }
    };

    const failed = (error: Error) => {
        if (ctx.setup && ctx.setup.emit) {
            ctx.setup.emit('failed', error);
        }

        if (ctx.onFailed) {
            ctx.onFailed(error);
        }
    };

    const busy = ref(false);

    const update = async (data: Partial<RECORD>) => {
        if (!domainAPI || busy.value || !entityId.value) {
            return;
        }

        busy.value = true;
        lockId.value = entityId.value;

        try {
            const response = await domainAPI.update(
                entityId.value,
                data,
            );

            entity.value = {
                ...data,
                ...response,
            };

            updated(entity.value as RECORD);
        } catch (e) {
            if (e instanceof Error) {
                failed(e);
            }
        } finally {
            busy.value = false;
            lockId.value = undefined;
        }
    };

    const remove = async () : Promise<void> => {
        if (!domainAPI || busy.value || !entityId.value) {
            return;
        }

        busy.value = true;
        lockId.value = entityId.value;

        try {
            const response = await domainAPI.delete(
                entityId.value,
            );

            entity.value = undefined;

            deleted(response);
        } catch (e) {
            if (e instanceof Error) {
                failed(e);
            }
        } finally {
            busy.value = false;
            lockId.value = undefined;
        }
    };

    const create = async (data: Partial<RECORD>) : Promise<void> => {
        if (!domainAPI || busy.value) {
            return;
        }

        busy.value = true;

        lockId.value = undefined;

        try {
            const response = await domainAPI.create(data);

            entity.value = response;

            created(response);
        } catch (e) {
            if (e instanceof Error) {
                failed(e);
            }
        } finally {
            busy.value = false;
            lockId.value = undefined;
        }
    };

    const createOrUpdate = async (data: Partial<RECORD>) : Promise<void> => {
        if (entity.value) {
            await update(data);
        } else {
            await create(data);
        }
    };

    let socket : EntitySocket | undefined;

    if (
        typeof ctx.socket !== 'boolean' ||
        typeof ctx.socket === 'undefined' ||
        typeof ctx.socket === 'function' ||
        ctx.socket
    ) {
        let socketContext : EntitySocketContext<TYPE, RECORD> = {
            type: ctx.type,
        };

        if (isObject(ctx.socket)) {
            socketContext = {
                ...socketContext,
                ...ctx.socket,
            };
        }

        socketContext.onCreated = created;
        socketContext.onUpdated = updated;
        socketContext.lockId = lockId;
        socketContext.realmId = realmId;
        socketContext.target = true;
        socketContext.targetId = entityId;

        socket = createEntitySocket(socketContext);
    }

    const error = ref<Error | undefined>(undefined);

    const resolveByRest = async (
        resolveCtx: EntityManagerResolveContext<RECORD> = {},
    ) : Promise<RECORD | null> => {
        if (entity.value && !resolveCtx.reset) {
            resolved(entity.value);
            return null;
        }

        entity.value = null;

        if (!domainAPI) {
            resolved(null);

            return null;
        }

        if (resolveCtx.id) {
            try {
                entity.value = await domainAPI.getOne(resolveCtx.id, resolveCtx.query as BuildInput<any>);

                if (socket) {
                    socket.subscribe();
                }

                resolved(entity.value);

                return entity.value;
            } catch (e) {
                if (e instanceof Error) {
                    error.value = e;
                }
            }
        }

        if (resolveCtx.query) {
            try {
                const response = await domainAPI.getMany({
                    ...resolveCtx.query as BuildInput<any>,
                    pagination: {
                        limit: 1,
                    },
                } as any);

                if (response.data.length === 1) {
                    [entity.value] = response.data;

                    if (socket) {
                        socket.subscribe();
                    }
                }

                resolved(entity.value as RECORD);

                return entity.value;
            } catch (e) {
                if (e instanceof Error) {
                    error.value = e;
                }
            }
        }

        resolved(null);

        return null;
    };
    const resolveByProps = (
        resolveCtx: EntityManagerResolveContext<RECORD> = {},
    ) : RECORD | null => {
        if (entity.value && !resolveCtx.reset) {
            resolved(entity.value);

            return entity.value;
        }

        entity.value = null;

        if (!ctx.props) {
            return null;
        }

        if (ctx.props.entity) {
            entity.value = ctx.props.entity;

            if (socket) {
                socket.subscribe();
            }

            resolved(entity.value);

            return entity.value;
        }

        return null;
    };

    if (ctx.props) {
        const propEntityRef = toRef(ctx.props, 'entity');
        const propsEntityId = computed(() => (propEntityRef.value ? propEntityRef.value.id : undefined));
        watch(propsEntityId, (val) => {
            entity.value = propEntityRef.value;

            if (val) {
                if (socket) {
                    socket.subscribe();
                }
            } else if (socket) {
                socket.unsubscribe();
            }
        });
    }

    resolveByProps();

    const resolve = async (
        resolveCtx: EntityManagerResolveContext<RECORD> = {},
    ): Promise<RECORD | null> => {
        if (entity.value && !resolveCtx.reset) {
            resolved(entity.value);

            return entity.value;
        }

        entity.value = null;

        let query : (RECORD extends Record<string, any> ? BuildInput<RECORD> : never) | undefined;
        if (resolveCtx.query) {
            query = resolveCtx.query;
        }

        let { id } = resolveCtx;

        if (ctx.props) {
            const propsResult = resolveByProps(resolveCtx);
            if (propsResult) {
                return propsResult;
            }

            if (
                ctx.props.query ||
                ctx.props.queryFields ||
                ctx.props.queryFilters
            ) {
                query = {
                    ...(ctx.props.query ? ctx.props.query : {}),
                    ...(ctx.props.queryFields ? { fields: ctx.props.queryFields } : {}),
                    ...(ctx.props.queryFilters ? { filters: ctx.props.queryFilters } : {}),
                } as any;
            }

            if (ctx.props.entityId) {
                id = ctx.props.entityId;
            }
        }

        return resolveByRest({
            query,
            id,
        });
    };

    const manager : EntityManager<RECORD> = {
        resolve,
        resolveByRest,

        lockId,
        busy,
        data: entity,
        error,

        create,
        createOrUpdate,
        created,

        update,
        updated,

        delete: remove,
        deleted,

        failed,

        render: () => undefined,
    };

    if (
        ctx.setup &&
        ctx.setup.expose
    ) {
        ctx.setup.expose(manager);
    }

    manager.render = (content?: VNodeChild | EntityManagerRenderFn): VNodeChild => {
        if (!ctx.setup || !ctx.setup.slots) {
            if (entity.value) {
                return typeof content === 'function' ?
                    content() :
                    content;
            }

            return undefined;
        }

        if (entity.value) {
            if (hasNormalizedSlot('default', ctx.setup.slots)) {
                return normalizeSlot(
                    'default',
                    buildEntityManagerSlotProps(manager),
                    ctx.setup.slots,
                );
            }

            return typeof content === 'function' ?
                content() :
                content;
        } if (
            isObject(error) &&
            hasNormalizedSlot('error', ctx.setup.slots)
        ) {
            return normalizeSlot('error', error, ctx.setup.slots);
        }

        return undefined;
    };

    return manager;
}
