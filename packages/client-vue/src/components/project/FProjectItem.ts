/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type {
    PropType,
} from 'vue';
import {
    defineComponent, h,
} from 'vue';
import type {
    Project,
} from '@privateaim/core-kit';
import { FProject } from './FProject';
import FProjectItemCard from './FProjectItemCard.vue';
import type { EntityManagerSlotProps } from '../../core';

const FProjectItem = defineComponent({
    props: {
        entity: {
            type: Object as PropType<Project>,
            required: true,
        },
    },
    emits: ['updated', 'failed', 'deleted'],
    setup(props, { emit }) {
        return () => h(FProject, {
            entity: props.entity,
            onDeleted(entity) {
                emit('deleted', entity);
            },
            onUpdated: (entity) => {
                emit('updated', entity);
            },
            onFailed(e) {
                emit('failed', e);
            },
        }, {
            default: (slotProps: EntityManagerSlotProps<Project>) => {
                if (!slotProps.data) {
                    return [];
                }

                return h(FProjectItemCard, {
                    entity: slotProps.data,
                    busy: slotProps.busy,
                    onDeleted: slotProps.deleted,
                });
            },
        });
    },
});

export {
    FProjectItem,
};
