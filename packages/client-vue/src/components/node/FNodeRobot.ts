/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityManagerSlotProps } from '@authup/client-web-kit';
import {
    ARobot,
    ARobotForm,
} from '@authup/client-web-kit';
import type { PropType } from 'vue';
import { defineComponent, h } from 'vue';
import type { Node } from '@privateaim/core-kit';
import type { Robot } from '@authup/core-kit';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<Node>,
            required: true,
        },
    },
    emits: ['failed', 'updated'],
    setup(props, { emit }) {
        return () => h(ARobot, {
            onFailed: (e) => {
                emit('failed', e);
            },
            queryFields: ['+secret'],
            queryFilters: {
                id: props.entity.robot_id,
            },
        }, {
            default: (slotProps: EntityManagerSlotProps<Robot>) => {
                if (!slotProps.data) {
                    return h(
                        'div',
                        { class: 'alert alert-sm alert-warning' },
                        [
                            'The robot details can not be displayed.',
                        ],
                    );
                }

                return h(ARobotForm, {
                    entity: slotProps.data,
                    name: slotProps.data.name,
                    realmId: slotProps.data.realm_id,
                    onUpdated: (item) => {
                        emit('updated', item);
                        slotProps.updated(item);
                    },
                });
            },
        });
    },
});
