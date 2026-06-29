/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { useFieldValidation } from '@ilingo/validup-vue';
import { useValidup } from '@validup/vue';
import type { Severity } from '@validup/vue';
import { VCAlert } from '@vuecs/elements';
import {
    VCFormGroup,
    VCFormInput,
    VCFormTextarea,
} from '@vuecs/forms';
import {
    computed,
    defineComponent,
    h,
    onMounted,
    reactive,
    ref,
    watch,
} from 'vue';
import type {
    PropType,
} from 'vue';

import type { MasterImage, Node, Project } from '@privateaim/core-kit';
import { DomainType, ProjectValidator } from '@privateaim/core-kit';
import { ValidatorGroup, generateName } from '@privateaim/kit';
import { useUpdatedAt } from '../../composables';
import type {
    ListFooterSlotProps,
    ListHeaderSlotProps,
    ListItemSlotProps,
    ListProps,
} from '../../core';
import {
    EntityListSlotName,
    buildFormSubmit,
    createEntityManager,
    defineEntityManagerEvents,
    initFormAttributesFromSource,
    injectCoreHTTPClient,
    renderEntityAssignAction,
    wrapFnWithBusyState,
} from '../../core';
import { FMasterImagePicker } from '../master-image';
import FNodes from '../node/FNodes';
import { FProjectNodeAssignAction } from '../project-node';
import { FPagination, FSearch } from '../utility';

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
            display_name: '',
            description: '',
            master_image_id: '',
        });

        const nodeIds = ref<string[]>([]);

        const manager = createEntityManager({
            type: `${DomainType.PROJECT}`,
            setup,
            props,
        });

        const $v = useValidup(
            new ProjectValidator(),
            form,
            { group: computed(() => (manager.data.value ? ValidatorGroup.UPDATE : ValidatorGroup.CREATE)) },
        );

        const nameValidation = useFieldValidation($v.fields.name);
        const displayNameValidation = useFieldValidation($v.fields.display_name);
        const descriptionValidation = useFieldValidation($v.fields.description);

        const toSeverity = (input: Severity) => (input === 'error' || input === 'warning' ? input : undefined);

        const initFromProperties = () => {
            if (!manager.data.value) return;

            initFormAttributesFromSource(form, manager.data.value);
        };

        initFromProperties();

        // Pre-fill an editable, generated name suggestion when creating a new
        // project. Runs client-side only to avoid SSR hydration mismatches.
        onMounted(() => {
            if (!props.entity && !form.name) {
                form.name = generateName();
            }
        });

        const updatedAt = useUpdatedAt(props.entity);

        watch(updatedAt, (val, oldVal) => {
            if (val && val !== oldVal) {
                manager.data.value = props.entity;

                initFromProperties();
            }
        });

        const handleMasterImagePicker = (item: MasterImage | null) => {
            if (item) {
                form.master_image_id = item.id;
            } else {
                form.master_image_id = '';
            }
        };

        const submit = wrapFnWithBusyState(busy, async () => {
            if ($v.$invalid.value) return;

            // Normalize the slug like the backend (trim + lowercase) so the
            // validated value is what gets submitted and stored.
            if (form.name) {
                form.name = form.name.trim().toLowerCase();
            }

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


        return () => {
            const displayName = h(
                VCFormGroup,
                {
                    label: true,
                    labelContent: 'Display Name',
                    validationMessages: displayNameValidation.messages,
                    validationSeverity: toSeverity(displayNameValidation.severity),
                },
                {
                    default: () => h(VCFormInput, {
                        modelValue: form.display_name == null ? '' : String(form.display_name),
                        'onUpdate:modelValue': (input: string) => {
                            form.display_name = input;
                        },
                    }),
                },
            );

            const name = h(
                VCFormGroup,
                {
                    label: true,
                    labelContent: 'Name',
                    validationMessages: nameValidation.messages,
                    validationSeverity: toSeverity(nameValidation.severity),
                },
                {
                    default: () => h(VCFormInput, {
                        modelValue: form.name == null ? '' : String(form.name),
                        'onUpdate:modelValue': (input: string) => {
                            form.name = input;
                        },
                    }),
                },
            );

            const description = h(
                VCFormGroup,
                {
                    label: true,
                    labelContent: 'Description',
                    validationMessages: descriptionValidation.messages,
                    validationSeverity: toSeverity(descriptionValidation.severity),
                },
                {
                    default: () => h(VCFormTextarea, {
                        modelValue: $v.fields.description.$model.value == null ? '' : String($v.fields.description.$model.value),
                        'onUpdate:modelValue': (input: string) => {
                            $v.fields.description.$model.value = input;
                        },
                        rows: 4,
                    }),
                },
            );

            const masterImagePicker = h(FMasterImagePicker, {
                entityId: form.master_image_id,
                onResolved(value: MasterImage | null) {
                    handleMasterImagePicker(value);
                },
            });

            const submitNode = buildFormSubmit({
                submit,
                busy: busy.value,
                isEditing: !!manager.data.value,
                invalid: $v.$invalid.value,
            });

            const nodeVNode = h('div', [
                h(FNodes, { query: { filters: { hidden: false } } } satisfies ListProps<Node>, {
                    [EntityListSlotName.HEADER]: (props: ListHeaderSlotProps<Node>) => [
                        h('label', 'Nodes'),
                        h(FSearch, {
                            load: props.load,
                            meta: props.meta,
                        }),
                    ],
                    [EntityListSlotName.ITEM]: (props: ListItemSlotProps<Node>) => {
                        const action = manager.data.value ?
                            h(FProjectNodeAssignAction, {
                                key: props.data.id,
                                nodeId: props.data.id,
                                projectId: manager.data.value.id,
                                realmId: manager.data.value.id,
                            }) :
                            renderEntityAssignAction({
                                item: nodeIds.value.includes(props.data.id) ? props.data.id : undefined,
                                add: () => toggleNodeIds(props.data.id),
                                drop: () => toggleNodeIds(props.data.id),
                            });

                        return h('div', { class: 'flex flex-row w-full' }, [
                            h('div', [
                                props.data.name,
                                ' ',
                                h('span', { class: 'text-fg-muted' }, `(${props.data.type})`),
                            ]),
                            h('div', { class: 'ms-auto' }, [action]),
                        ]);
                    },
                    [EntityListSlotName.FOOTER]: (props: ListFooterSlotProps<Node>) => h(FPagination, {
                        load: props.load,
                        meta: props.meta,
                    }),
                }),
                h(VCAlert, {
                    color: 'neutral', 
                    variant: 'soft', 
                    size: 'sm', 
                    class: 'mb-3', 
                }, () => [
                    'Chose a arbitrary amount of target nodes.',
                ]),
            ]);

            return h(
                'div',
                { class: 'flex flex-wrap -mx-2' },
                [
                    h(
                        'div',
                        { class: 'flex-1 basis-0 px-2' },
                        [
                            displayName,
                            h('hr'),
                            name,
                            h('hr'),
                            description,
                            h('hr'),
                            masterImagePicker,
                        ],
                    ),
                    h(
                        'div',
                        { class: 'flex-1 basis-0 px-2' },
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
