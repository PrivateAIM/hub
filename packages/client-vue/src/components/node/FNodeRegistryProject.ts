/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType } from 'vue';
import { defineComponent, h } from 'vue';
import type { Node, RegistryProject } from '@privateaim/core';
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
        if (!props.entity.registry_id) {
            return () => h(
                'div',
                { class: 'alert alert-sm alert-warning' },
                [
                    'The node has not been assigned to a registry yet.',
                ],
            );
        }

        if (!props.entity.registry_project_id) {
            return () => h(
                'div',
                { class: 'alert alert-sm alert-warning' },
                [
                    'No related registry-resource exists at the moment.',
                    ' ',
                    'To create one, execute the update operation after a registry is selected.',
                ],
            );
        }

        return () => h(
            RegistryProjectDetails,
            {
                entityId: props.entity.registry_project_id as string,
                onUpdated: (entity: RegistryProject) => {
                    emit('updated', {
                        registry_project_id: entity.id,
                        registry_project: entity,
                    });
                },
                onFailed: (e) => {
                    emit('failed', e);
                },
                onResolved: (entity?: RegistryProject) => {
                    if (!entity) { return; }

                    if (props.entity.registry_project_id !== entity.id) {
                        emit('updated', {
                            registry_project_id: entity.id,
                            registry_project: entity,
                        });
                    }
                },
            },
        );
    },
});
