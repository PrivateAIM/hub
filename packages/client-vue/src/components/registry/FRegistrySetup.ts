/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType } from 'vue';
import { defineComponent, h, ref } from 'vue';
import type { Registry } from '@privateaim/core';
import { RegistryAPICommand } from '@privateaim/core';
import { injectCoreHTTPClient } from '../../core';
import EntityDelete from '../EntityDelete';
import MasterImageList from '../master-image/FMasterImages';

export default defineComponent({
    components: { EntityDelete, MasterImageList },
    props: {
        entityId: {
            type: String as PropType<Registry['id']>,
            required: true,
        },
    },
    emits: ['executed', 'failed'],
    setup(props, { emit }) {
        const apiClient = injectCoreHTTPClient();
        const busy = ref(false);

        const setup = async () => {
            if (busy.value) return;

            busy.value = true;

            try {
                await apiClient.service.runRegistryCommand(RegistryAPICommand.SETUP, {
                    id: props.entityId,
                });

                emit('executed');
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }

            busy.value = false;
        };

        return () => h('div', [
            h('h6', [
                h('i', { class: 'fa fa-info me-1' }),
                'Info',
            ]),
            h('p', [
                'To setup or ensure the existence of all projects and ',
                'the corresponding webhooks run the setup routine.',
            ]),

            h('button', {
                type: 'button',
                disabled: busy.value,
                class: 'btn btn-xs btn-dark',
                onClick(event: any) {
                    event.preventDefault();

                    return setup();
                },
            }, [
                'Execute',
            ]),
        ]);
    },
});
