/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { useAbilityCheck } from '@authup/client-web-kit';
import { VCTimeago } from '@vuecs/timeago';
import type {
    PropType, VNode,
} from 'vue';
import {
    defineComponent, h,
} from 'vue';
import type {
    Project,
} from '@privateaim/core';
import {
    DomainType,
    PermissionID,
} from '@privateaim/core';
import { VCLink } from '@vuecs/link';
import {
    EntityListSlotName, hasNormalizedSlot, normalizeSlot,
} from '../../core';
import EntityDelete from '../EntityDelete';
import { FProject } from './FProject';
import type { EntityManagerSlotProps } from '../../core';

const FProjectItem = defineComponent({
    props: {
        entity: {
            type: Object as PropType<Project>,
            required: true,
        },
    },
    emits: ['updated', 'failed', 'deleted'],
    setup(props, { slots, emit }) {
        const canDrop = useAbilityCheck(PermissionID.PROJECT_DROP);

        return () => h(FProject, {
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
            default: (props: EntityManagerSlotProps<Project>) => {
                if (!props.data) {
                    return [];
                }

                let deleteAction : VNode | undefined;

                let itemActions : VNode | VNode[] | undefined;

                if (canDrop.value) {
                    deleteAction = h(
                        EntityDelete,
                        {
                            withText: false,
                            entityId: props.data.id,
                            entityType: DomainType.PROJECT,
                            disabled: props.busy || props.data.analyses > 0,
                            class: 'btn btn-xs btn-danger ms-1',
                            onDeleted(data: any) {
                                props.deleted(data);
                            },
                        },
                    );
                }

                if (hasNormalizedSlot(EntityListSlotName.ITEM_ACTIONS, slots)) {
                    itemActions = normalizeSlot(EntityListSlotName.ITEM_ACTIONS, props, slots);
                } else {
                    itemActions = [
                        h(
                            VCLink,
                            {
                                to: `/projects/${props.data.id}`,
                                disabled: props.busy,
                                class: 'btn btn-xs btn-dark',
                            },
                            [
                                h('i', { class: 'fa fa-bars' }),
                            ],
                        ),
                    ];

                    if (deleteAction) {
                        itemActions.push(deleteAction);
                    }
                }

                return h(
                    'div',
                    { class: 'p-1 w-100' },
                    [
                        h(
                            'div',
                            { class: 'd-flex flex-row algin-items-center' },
                            [
                                h('div', [
                                    h('i', {
                                        class: 'fa-solid fa-scroll pe-1',
                                    }),
                                ]),
                                h(
                                    'div',
                                    [
                                        h(
                                            VCLink,
                                            {
                                                to: `/projects/${props.data.id}`,
                                                class: 'mb-0',
                                            },
                                            [
                                                props.data.name,
                                            ],
                                        ),
                                    ],
                                ),
                                h(
                                    'div',
                                    {
                                        class: 'ms-auto',
                                    },
                                    itemActions,
                                ),
                            ],
                        ),
                        h(
                            'div',
                            {
                                class: 'd-flex flex-row',
                            },
                            [
                                h('div', [
                                    h(
                                        'small',
                                        [
                                            h('span', { class: 'text-primary' }, [props.data.analyses]),
                                            ' ',
                                            'Analyses',
                                        ],
                                    ),
                                    h('span', { class: 'me-1' }, [',']),
                                    h('small', [
                                        h('span', { class: 'text-muted' }, [
                                            'updated',
                                        ]),
                                        ' ',
                                        h(VCTimeago, {
                                            datetime: props.data.updated_at,
                                        }),
                                    ]),
                                ]),
                                h('div', { class: 'ms-auto' }, [
                                    h('small', [
                                        h('span', { class: 'text-muted' }, [
                                            'created by',
                                        ]),
                                        ' ',
                                        h('span', [
                                            props.data.user_id,
                                        ]),
                                    ]),
                                ]),
                            ],
                        ),
                    ],
                );
            },
        });
    },
});

export {
    FProjectItem,
};
