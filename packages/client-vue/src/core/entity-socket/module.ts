/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DomainEventFullName } from '@privateaim/kit';
import { buildDomainEventFullName } from '@privateaim/kit';
import { EntityDefaultEventName } from '@authup/core-kit';
import type {
    DomainTypeMap,
} from '@privateaim/core-kit';
import {
    DomainEventSubscriptionName,
    DomainType,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@privateaim/core-kit';
import type {
    STCEventHandler,
    STCEventRecord,
} from '@privateaim/core-realtime-kit';
import {
    computed, 
    isRef, 
    onMounted, 
    onUnmounted, 
    unref,
    watch,
} from 'vue';
import type { MaybeRef } from 'vue';
import { injectStore, storeToRefs } from '@authup/client-web-kit';
import type { EntitySocket, EntitySocketContext } from './type';
import { injectSocketManager, isSocketManagerUsable } from '../socket';

/**
 * Realm-less catalogs: their events are published to the global namespace only.
 */
const GLOBAL_NAMESPACE_TYPES: string[] = [
    DomainType.MASTER_IMAGE,
    DomainType.MASTER_IMAGE_GROUP,
    DomainType.REGISTRY,
    DomainType.REGISTRY_PROJECT,
];

/**
 * The namespace to connect to: the global one (`undefined`) for a realm-less
 * catalog, else the requested realm, else the current management realm. The
 * global namespace needs a grant reaching every realm, and a list's realm ref
 * is often empty, meaning "current".
 */
export function resolveEntitySocketRealmId(
    type: string,
    realmId: MaybeRef<string | undefined>,
    managementRealmId: string | undefined,
): string | undefined {
    if (GLOBAL_NAMESPACE_TYPES.includes(type)) {
        return undefined;
    }

    return unref(realmId) || managementRealmId;
}

export function createEntitySocket<
    TYPE extends keyof DomainTypeMap,
    RECORD extends DomainTypeMap[TYPE],
>(
    ctx: EntitySocketContext<TYPE, RECORD>,
) : EntitySocket {
    if (!isSocketManagerUsable()) {
        return {
            subscribe() {

            },
            unsubscribe() {

            },
        };
    }

    const socketManager = injectSocketManager();
    const store = injectStore();
    const storeRefs = storeToRefs(store);

    const realmId = computed(() => resolveEntitySocketRealmId(ctx.type, ctx.realmId, storeRefs.realmManagementId.value));

    const targetId = computed(() => (isRef(ctx.targetId) ? ctx.targetId.value : ctx.targetId));

    const lockId = computed(() => (isRef(ctx.lockId) ? ctx.lockId.value : ctx.lockId));

    const processEvent = (event: STCEventRecord<TYPE, RECORD>) : boolean => {
        if (
            ctx.processEvent &&
            !ctx.processEvent(event, realmId.value)
        ) {
            return false;
        }

        const channelName = ctx.buildChannelName ?
            ctx.buildChannelName(targetId.value) :
            buildDomainChannelName(ctx.type, targetId.value);

        if (event.meta.roomName !== channelName) {
            return false;
        }

        if (ctx.target) {
            if (!targetId.value || !event.meta.refId) {
                return false;
            }

            if (targetId.value !== event.meta.refId) {
                return false;
            }
        }

        if (event.meta.refId) {
            return event.meta.refId !== lockId.value;
        }

        return true;
    };

    const handleCreated : STCEventHandler<TYPE, RECORD> = (
        event,
    ) => {
        if (!processEvent(event)) {
            return;
        }

        if (ctx.onCreated) {
            ctx.onCreated(event.data as RECORD);
        }
    };

    const handleUpdated : STCEventHandler<TYPE, RECORD> = (
        event,
    ) => {
        if (!processEvent(event)) {
            return;
        }

        if (ctx.onUpdated) {
            ctx.onUpdated(event.data as RECORD);
        }
    };
    const handleDeleted : STCEventHandler<TYPE, RECORD> = (
        event,
    ) => {
        if (!processEvent(event)) {
            return;
        }

        if (ctx.onDeleted) {
            ctx.onDeleted(event.data as RECORD);
        }
    };

    let emitEventRetryCount = 0;
    const emitEvent = async (
        socket: Awaited<ReturnType<typeof socketManager.connect>>,
        event: DomainEventFullName<string, DomainEventSubscriptionName> | undefined,
    ) => {
        try {
            await socket.emitWithAck<any>(
                event,
                targetId.value as EventTarget,
                (err: any) => {
                    console.log(err);
                    // todo: handle error!
                },
            );
        } catch (e) {
            if (emitEventRetryCount > 3) {
                throw e;
            }

            emitEventRetryCount += 1;

            await new Promise((resolve) => { setTimeout(resolve, 0); });

            await emitEvent(socket, event);
        }
    };

    let isActive = false;
    // The namespace the active subscription lives in: realmId can change
    // (management realm switch) while subscribed, and unsubscribe must leave
    // the namespace it joined, not the recomputed one.
    let activeRealmId : string | undefined;
    const subscribe = async () => {
        if ((ctx.target && !targetId.value) || isActive) {
            return;
        }

        isActive = true;
        activeRealmId = realmId.value;

        const socket = await socketManager.connect(buildDomainNamespaceName(activeRealmId));
        let event : DomainEventFullName<string, DomainEventSubscriptionName> | undefined;
        if (ctx.buildSubscribeEventName) {
            event = ctx.buildSubscribeEventName(activeRealmId);
        } else {
            event = buildDomainEventFullName(
                ctx.type,
                DomainEventSubscriptionName.SUBSCRIBE,
            );
        }

        if (ctx.onCreated) {
            socket.on<any>(buildDomainEventFullName(
                ctx.type,
                EntityDefaultEventName.CREATED,
            ), handleCreated);
        }

        if (ctx.onUpdated) {
            socket.on<any>(buildDomainEventFullName(
                ctx.type,
                EntityDefaultEventName.UPDATED,
            ), handleUpdated);
        }

        if (ctx.onDeleted) {
            socket.on<any>(buildDomainEventFullName(
                ctx.type,
                EntityDefaultEventName.DELETED,
            ), handleDeleted);
        }

        await emitEvent(socket, event);
    };

    const unsubscribe = async () => {
        if ((ctx.target && !targetId.value) || !isActive) {
            return;
        }

        isActive = false;

        const socket = await socketManager.connect(buildDomainNamespaceName(activeRealmId));

        let event : DomainEventFullName<string, DomainEventSubscriptionName>;
        if (ctx.buildUnsubscribeEventName) {
            event = ctx.buildUnsubscribeEventName(activeRealmId);
        } else {
            event = buildDomainEventFullName(
                ctx.type,
                DomainEventSubscriptionName.UNSUBSCRIBE,
            );
        }

        if (ctx.onCreated) {
            socket.off<any>(buildDomainEventFullName(
                ctx.type,
                EntityDefaultEventName.CREATED,
            ), handleCreated);
        }

        if (ctx.onUpdated) {
            socket.off<any>(buildDomainEventFullName(
                ctx.type,
                EntityDefaultEventName.UPDATED,
            ), handleUpdated);
        }

        if (ctx.onDeleted) {
            socket.off<any>(buildDomainEventFullName(
                ctx.type,
                EntityDefaultEventName.DELETED,
            ), handleDeleted);
        }

        await emitEvent(socket, event);
    };

    let isMounted : boolean = false;
    onMounted(() => {
        isMounted = true;
        return subscribe();
    });
    onUnmounted(() => {
        isMounted = false;
        return unsubscribe();
    });

    watch([targetId, realmId], ([val, realm], [oldValue, oldRealm]) => {
        if ((val !== oldValue || realm !== oldRealm) && isMounted) {
            Promise.resolve()
                .then(() => unsubscribe())
                .then(() => subscribe());
        }
    });

    return {
        subscribe,
        unsubscribe,
    };
}
