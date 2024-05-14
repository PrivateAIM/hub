/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useAbilityCheck } from '@authup/client-web-kit';
import { VCTimeago } from '@vuecs/timeago';
import type { PropType, VNodeArrayChildren, VNodeChild } from 'vue';
import {
    defineComponent, h, ref,
} from 'vue';
import type {
    Analysis,
} from '@privateaim/core';
import {
    PermissionID,
} from '@privateaim/core';
import { VCLink } from '@vuecs/link';
import TrainEntity from './FAnalysis';
import TrainPipeline from './FAnalysisPipeline.vue';
import FAnalysisNodesProgress from '../analysis-node/FAnalysisNodesProgress.vue';
import TrainName from './FAnalysisName';
import EntityDelete from '../EntityDelete';
import type { EntityManagerSlotProps } from '../../core';

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
        const extendedView = ref(false);
        const toggleView = () => {
            extendedView.value = !extendedView.value;
        };

        const handleExecuted = (component: string, command: string) => {
            emit('executed', component, command);
        };

        const isAllowed = useAbilityCheck(PermissionID.ANALYSIS_DROP);

        return () => h(TrainEntity, {
            entity: props.entity,
            onDeleted(entity) {
                emit('deleted', entity);
            },
            onUpdated(entity) {
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

                let deleteButton : VNodeArrayChildren = [];

                if (isAllowed.value) {
                    deleteButton = [
                        h(EntityDelete, {
                            withText: false,
                            entityId: slotProps.data.id,
                            entityType: 'analysis',
                            class: 'btn btn-danger btn-xs ms-1',
                            onDeleted(data: any) {
                                slotProps.deleted(data);
                            },
                        }),
                    ];
                }

                return h(
                    'div',
                    {
                        class: 'train-card',
                    },
                    [
                        h(
                            'div',
                            {
                                class: 'train-card-content align-items-center',
                            },
                            [
                                h('div', [
                                    h(
                                        TrainName,
                                        {
                                            entityId: slotProps.data.id,
                                            entityName: slotProps.data.name,
                                            editable: true,
                                            onUpdated(item: Analysis) {
                                                slotProps.updated(item);
                                            },
                                        },
                                        {
                                            default: (nameProps: any) => {
                                                let trainName : VNodeArrayChildren = [];

                                                if (nameProps.entityName) {
                                                    trainName = [
                                                        h(
                                                            'span',
                                                            {
                                                                class: 'text-muted ms-1',
                                                            },
                                                            nameProps.entityId,
                                                        ),
                                                    ];
                                                }

                                                return [
                                                    h('i', { class: 'fa-solid fa-train-tram me-1' }),
                                                    h(VCLink, {
                                                        to: `/analyses/${nameProps.entityId}`,
                                                    }, [
                                                        nameProps.nameDisplay,
                                                    ]),
                                                    trainName,
                                                ];
                                            },
                                        },
                                    ),
                                ]),
                                h('div', { class: 'ms-auto' }, [
                                    h('button', {
                                        class: 'btn btn-dark btn-xs',
                                        onClick(event: any) {
                                            event.preventDefault();

                                            toggleView();
                                        },
                                    }, [
                                        h('i', {
                                            class: ['fa', {
                                                'fa-chevron-down': !extendedView.value,
                                                'fa-chevron-up': extendedView.value,
                                            }],
                                        }),
                                    ]),
                                    h(VCLink, {
                                        class: 'btn btn-dark btn-xs ms-1',
                                        type: 'button',
                                        to: `/analyses/${slotProps.data.id}`,
                                    }, [
                                        h('i', { class: 'fa fa-bars' }),
                                    ]),
                                    deleteButton,
                                ]),
                            ],
                        ),
                        h('hr', {
                            class: 'mt-1 mb-1',
                        }),
                        h(TrainPipeline, {
                            entity: slotProps.data,
                            withCommand: extendedView.value,
                            listDirection: extendedView.value ? 'column' : 'row',
                            onUpdated(item: Analysis) {
                                slotProps.updated(item);
                            },
                            onFailed(error: Error) {
                                slotProps.failed(error);
                            },
                            onDeleted() {
                                slotProps.deleted();
                            },
                            onExecuted(component: string, command: string) {
                                handleExecuted(component, command);
                            },
                        }),
                        h(FAnalysisNodesProgress, {
                            class: 'mt-1 mb-1',
                            entity: slotProps.data,
                            elementType: 'progress-bar',
                        }),
                        h('div', {
                            class: 'train-card-footer',
                        }, [
                            h('div', [
                                h('small', [
                                    h('span', { class: 'text-muted' }, 'updated'),
                                    ' ',
                                    h(VCTimeago, { datetime: slotProps.data.updated_at }),
                                ]),
                            ]),
                        ]),
                    ],
                );
            },
        });
    },
});

export {
    FAnalysisItem,
};
