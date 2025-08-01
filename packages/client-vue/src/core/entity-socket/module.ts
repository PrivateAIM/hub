/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DomainEventFullName } from '@privateaim/kit';
import { buildDomainEventFullName, hasOwnProperty } from '@privateaim/kit';
import { EntityDefaultEventName, REALM_MASTER_NAME } from '@authup/core-kit';
import type {
    DomainTypeMap,
} from '@privateaim/core-kit';
import {
    DomainEventSubscriptionName,
    buildDomainChannelName,
    buildDomainNamespaceName,
} from '@privateaim/core-kit';
import type {
    STCEventHandler,
    STCEventRecord,
} from '@privateaim/core-realtime-kit';
import {
    computed, isRef, onMounted, onUnmounted, watch,
} from 'vue';
import { injectStore, storeToRefs } from '@authup/client-web-kit';
import type { EntitySocket, EntitySocketContext } from './type';
import { injectSocketManager, isSocketManagerUsable } from '../socket';

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

    const realmId = computed(() => {
        if (storeRefs.realmName.value === REALM_MASTER_NAME) {
            return undefined;
        }

        if (isRef(ctx.realmId)) {
            return ctx.realmId.value;
        }

        if (ctx.realmId) {
            return ctx.realmId;
        }

        return storeRefs.realmId.value;
    });

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

        if (
            ctx.target &&
            !targetId.value
        ) {
            return false;
        }

        if (ctx.target) {
            if (hasOwnProperty(event.data, 'id')) {
                if (targetId.value !== event.data.id) {
                    return false;
                }
            } else {
                return false;
            }
        }

        if (hasOwnProperty(event.data, 'id')) {
            return event.data.id !== lockId.value;
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
    const subscribe = async () => {
        if ((ctx.target && !targetId.value) || isActive) {
            return;
        }

        isActive = true;

        const socket = await socketManager.connect(buildDomainNamespaceName(realmId.value));
        let event : DomainEventFullName<string, DomainEventSubscriptionName> | undefined;
        if (ctx.buildSubscribeEventName) {
            event = ctx.buildSubscribeEventName();
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

        const socket = await socketManager.connect(buildDomainNamespaceName(realmId.value));

        let event : DomainEventFullName<string, DomainEventSubscriptionName>;
        if (ctx.buildUnsubscribeEventName) {
            event = ctx.buildUnsubscribeEventName();
        } else {
            event = buildDomainEventFullName(
                ctx.type,
                DomainEventSubscriptionName.UNSUBSCRIBE,
            );
        }

        if (ctx.onCreated) {
            socket.off<any>(buildDomainEventFullName(
                ctx.type,
                EntityDefaultEventName.UPDATED,
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

    watch(targetId, (val, oldValue) => {
        if (val !== oldValue && isMounted) {
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
