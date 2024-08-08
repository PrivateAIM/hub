/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType, VNodeChild } from 'vue';
import {
    defineComponent, h,
} from 'vue';
import type {
    Analysis,
} from '@privateaim/core-kit';
import TrainEntity from './FAnalysis';
import TrainPipeline from './FAnalysisPipeline.vue';
import FAnalysisNodesProgress from '../analysis-node/FAnalysisNodesProgress.vue';
import TrainName from './FAnalysisName';
import type { EntityManagerSlotProps } from '../../core';
import FAnalysisItemCard from './FAnalysisItemCard.vue';

const FAnalysisItem = defineComponent({
    components: {
        TrainName,
        FAnalysisNodesProgress,
        TrainPipeline,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['updated', 'deleted', 'failed', 'executed'],
    setup(props, { emit }) {
        const handleExecuted = (component: string, command: string) => {
            emit('executed', component, command);
        };

        return () => h(TrainEntity, {
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
            default: (slotProps: EntityManagerSlotProps<Analysis>) : VNodeChild => {
                if (!slotProps.data) {
                    return [];
                }

                return h(FAnalysisItemCard, {
                    entity: slotProps.data,
                    busy: slotProps.busy,
                    onDeleted: slotProps.deleted,
                    onExecuted: handleExecuted,
                    onFailed: slotProps.failed,
                    onUpdated: slotProps.updated,
                });
            },
        });
    },
});

export {
    FAnalysisItem,
};
