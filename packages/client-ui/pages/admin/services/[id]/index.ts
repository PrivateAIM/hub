/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType } from 'vue';
import { ServiceID } from '@privateaim/core';
import { MasterImagesSync } from '@privateaim/client-vue';
import { useToast } from '#imports';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    props: {
        entityId: {
            type: String as PropType<ServiceID>,
            required: true,
        },
    },
    emits: ['updated'],
    setup(props, { emit }) {
        const toast = useToast();

        const handleFailed = (e: Error) => {
            if (toast) {
                toast.show({ variant: 'warning', body: e.message });
            }
        };

        if (props.entityId === ServiceID.REGISTRY) {
            return () => h(MasterImagesSync, {
                entityId: props.entityId,
                onUpdated(event: any) {
                    emit('updated', event);
                },
                onFailed(e: Error) {
                    handleFailed(e);
                },
            });
        }

        return () => h('div', {
            class: 'alert alert-info alert-sm',
        }, `You can not execute any task for the ${props.entityId} service yet.`);
    },
});
