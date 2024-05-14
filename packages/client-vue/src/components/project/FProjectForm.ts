/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { buildFormSubmitWithTranslations, createFormSubmitTranslations } from '@authup/client-web-kit';
import { getSeverity, useTranslationsForNestedValidations } from '@ilingo/vuelidate';
import {
    buildFormGroup, buildFormInput,
} from '@vuecs/form-controls';
import type { ListHeaderSlotProps, ListItemSlotProps } from '@vuecs/list-controls';
import useVuelidate from '@vuelidate/core';
import { maxLength, minLength, required } from '@vuelidate/validators';
import {
    defineComponent,
    h,
    reactive, ref,
    watch,
} from 'vue';
import type {
    PropType,
} from 'vue';

import type { MasterImage, Node, Project } from '@privateaim/core';
import { DomainType } from '@privateaim/core';
import { useUpdatedAt } from '../../composables';
import type { ListProps } from '../../core';
import {
    EntityListSlotName,
    createEntityManager,
    defineEntityManagerEvents,
    initFormAttributesFromSource,
    injectCoreHTTPClient,
    renderEntityAssignAction,
    wrapFnWithBusyState,
} from '../../core';
import MasterImagePicker from '../master-image/FMasterImagePicker';
import FNodes from '../node/FNodes';
import FProjectNodeAssignAction from '../project-node/FProjectNodeAssignAction';
import { FSearch } from '../utility';

const FProjectForm = defineComponent({
    props: {
        entity: {
            type: Object as PropType<Project>,
            default: undefined,
        },
    },
    emits: defineEntityManagerEvents<Project>(),
    setup(props, setup) {
        const apiClient = injectCoreHTTPClient();
        const busy = ref(false);
        const form = reactive({
            name: '',
            master_image_id: '',
        });

        const $v = useVuelidate({
            name: {
                required,
                minLength: minLength(5),
                maxLength: maxLength(100),
            },
            master_image_id: {
                required,
            },
        }, form);

        const nodeIds = ref<string[]>([]);

        const manager = createEntityManager({
            type: `${DomainType.PROJECT}`,
            setup,
            props,
        });

        const initFromProperties = () => {
            if (!manager.data.value) return;

            initFormAttributesFromSource(form, manager.data.value);
        };

        initFromProperties();

        const updatedAt = useUpdatedAt(props.entity);

        watch(updatedAt, (val, oldVal) => {
            if (val && val !== oldVal) {
                manager.data.value = props.entity;

                initFromProperties();
            }
        });

        const handleMasterImagePicker = (item: MasterImage) => {
            if (item) {
                form.master_image_id = item.id;
            } else {
                form.master_image_id = '';
            }
        };

        const submit = wrapFnWithBusyState(busy, async () => {
            if ($v.value.$invalid) return;

            const existed = !!manager.data.value;
            await manager.createOrUpdate(form);

            if (!existed && manager.data.value) {
                for (let i = 0; i < nodeIds.value.length; i++) {
                    await apiClient.projectNode.create({
                        project_id: manager.data.value.id,
                        node_id: nodeIds.value[i],
                    });
                }
            }
        });

        const toggleNodeIds = (id: string) => {
            const index = nodeIds.value.indexOf(id);
            if (index === -1) {
                nodeIds.value.push(id);
            } else {
                nodeIds.value.splice(index, 1);
            }
        };

        const translationsValidation = useTranslationsForNestedValidations($v.value);
        const translationsSubmit = createFormSubmitTranslations();

        return () => {
            const name = buildFormGroup({
                validationMessages: translationsValidation.name.value,
                validationSeverity: getSeverity($v.value.name),
                label: true,
                labelContent: 'Name',
                content: buildFormInput({
                    value: form.name,
                    onChange(input) {
                        form.name = input;
                    },
                }),
            });

            const masterImagePicker = h(MasterImagePicker, {
                entityId: form.master_image_id,
                onSelected(value: MasterImage) {
                    handleMasterImagePicker(value);
                },
            });

            const submitNode = buildFormSubmitWithTranslations({
                submit,
                busy: busy.value,
                isEditing: !!manager.data.value,
                invalid: $v.value.$invalid,
            }, translationsSubmit);

            const nodeVNode = h('div', [
                h(FNodes, {
                    query: {
                        filters: {
                            hidden: false,
                        },
                    },
                } satisfies ListProps<Node>, {
                    [EntityListSlotName.HEADER]: (props: ListHeaderSlotProps<Node>) => [
                        h('label', 'Nodes'),
                        h(FSearch, {
                            load: props.load,
                            meta: props.meta,
                        }),
                    ],
                    [EntityListSlotName.ITEM_ACTIONS]: (props: ListItemSlotProps<Node>) => {
                        if (manager.data.value) {
                            return h(FProjectNodeAssignAction, {
                                nodeId: props.data.id,
                                projectId: manager.data.value.id,
                                realmId: manager.data.value.id,
                            });
                        }

                        const itemIndex = nodeIds.value.indexOf(props.data.id);

                        return renderEntityAssignAction({
                            item: itemIndex === -1 ? undefined : nodeIds.value[itemIndex],
                            add: () => toggleNodeIds(props.data.id),
                            drop: () => toggleNodeIds(props.data.id),
                        });
                    },
                }),
                h('div', { class: 'alert alert-dark alert-sm' }, [
                    'Chose a arbitrary amount of target nodes.',
                ]),
            ]);

            return h(
                'div',
                { class: 'row' },
                [
                    h(
                        'div',
                        { class: 'col' },
                        [
                            name,
                            h('hr'),
                            masterImagePicker,
                        ],
                    ),
                    h(
                        'div',
                        { class: 'col' },
                        [
                            nodeVNode,
                            h('hr'),
                            submitNode,
                        ],
                    ),
                ],
            );
        };
    },
});

export {
    FProjectForm,
};
