/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EntityDefaultEventName, REALM_MASTER_NAME } from '@authup/core-kit';
import type {
    DomainEventSubscriptionFullName,
    DomainTypeMap,
} from '@privateaim/core-kit';
import {
    DomainEventSubscriptionName,
    buildDomainChannelName,
    buildDomainEventFullName,
    buildDomainEventSubscriptionFullName,
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
            mount() {

            },
            unmount() {

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

        if (ctx.target && (!targetId.value || targetId.value !== event.data.id)) {
            return false;
        }

        return event.data.id !== lockId.value;
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

    let mounted = false;
    const mount = async () => {
        if ((ctx.target && !targetId.value) || mounted) {
            return;
        }

        mounted = true;

        const socket = await socketManager.connect(buildDomainNamespaceName(realmId.value));

        socket.on<any>('authenticated', (val) => {
            console.log(val);
        });
        let event : DomainEventSubscriptionFullName<TYPE> | undefined;
        if (ctx.buildSubscribeEventName) {
            event = ctx.buildSubscribeEventName();
        } else {
            event = buildDomainEventSubscriptionFullName(
                ctx.type,
                DomainEventSubscriptionName.SUBSCRIBE,
            );
        }

        socket.emit<any>(
            event,
            targetId.value as EventTarget,
            () => {
                // todo: handle error!
            },
        );

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
    };

    const unmount = async () => {
        if ((ctx.target && !targetId.value) || !mounted) {
            return;
        }

        mounted = false;

        const socket = await socketManager.connect(buildDomainNamespaceName(realmId.value));

        let event : DomainEventSubscriptionFullName<TYPE>;
        if (ctx.buildUnsubscribeEventName) {
            event = ctx.buildUnsubscribeEventName();
        } else {
            event = buildDomainEventSubscriptionFullName(
                ctx.type,
                DomainEventSubscriptionName.SUBSCRIBE,
            );
        }

        socket.emit<any>(
            event,
            targetId.value as EventTarget,
        );

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
    };

    onMounted(() => mount());
    onUnmounted(() => unmount());

    watch(targetId, (val, oldValue) => {
        if (val !== oldValue) {
            Promise.resolve()
                .then(() => unmount())
                .then(() => mount());
        }
    });

    return {
        mount,
        unmount,
    };
}
