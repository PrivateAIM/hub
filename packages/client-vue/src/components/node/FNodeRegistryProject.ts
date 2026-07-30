/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType } from 'vue';
import { defineComponent, h } from 'vue';
import { VCAlert } from '@vuecs/elements';
import type { Node, RegistryProject } from '@privateaim/core-kit';
import RegistryProjectDetails from '../registry-project/FRegistryProject';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<Node>,
            required: true,
        },
    },
    emits: ['resolved', 'failed', 'updated'],
    setup(props, { emit }) {
        if (!props.entity.registryId) {
            return () => h(
                VCAlert,
                {
                    color: 'warning', 
                    variant: 'soft', 
                    size: 'sm', 
                    class: 'mb-3',
                },
                () => [
                    'The node has not been assigned to a registry yet.',
                ],
            );
        }

        if (!props.entity.registryProjectId) {
            return () => h(
                VCAlert,
                {
                    color: 'warning', 
                    variant: 'soft', 
                    size: 'sm', 
                    class: 'mb-3',
                },
                () => [
                    'No related registry-resource exists at the moment.',
                    ' ',
                    'To create one, execute the update operation after a registry is selected.',
                ],
            );
        }

        return () => h(
            RegistryProjectDetails,
            {
                entityId: props.entity.registryProjectId as string,
                onUpdated: (entity: RegistryProject) => {
                    emit('updated', {
                        registryProjectId: entity.id,
                        registryProject: entity,
                    });
                },
                onFailed: (e) => {
                    emit('failed', e);
                },
                onResolved: (entity?: RegistryProject) => {
                    if (!entity) { return; }

                    if (props.entity.registryProjectId !== entity.id) {
                        emit('updated', {
                            registryProjectId: entity.id,
                            registryProject: entity,
                        });
                    }
                },
            },
        );
    },
});
