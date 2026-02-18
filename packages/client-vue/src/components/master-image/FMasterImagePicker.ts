/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getSeverity, useTranslationsForNestedValidations } from '@ilingo/vuelidate';
import type { MasterImage, MasterImageGroup } from '@privateaim/core-kit';
import type { FormSelectOption } from '@vuecs/form-controls';
import { buildFormGroup, buildFormSelect } from '@vuecs/form-controls';
import type { ListBodySlotProps } from '@vuecs/list-controls';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import type { PropType, VNodeArrayChildren } from 'vue';
import {
    computed, defineComponent, h, nextTick, reactive, ref, toRef, watch,
} from 'vue';
import { ProcessStatus } from '@privateaim/kit';
import {
    EntityListSlotName, injectCoreHTTPClient, wrapFnWithBusyState,
} from '../../core';
import MasterImageGroupList from '../master-image-group/FMasterImageGroups';
import MasterImageList from './FMasterImages';

export default defineComponent({
    components: { MasterImageList },
    props: {
        entityId: {
            type: String,
        },
        entity: {
            type: Object as PropType<MasterImage>,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['selected', 'resolved'],
    async setup(props, { emit }) {
        const entityId = toRef(props, 'entityId');
        const apiClient = injectCoreHTTPClient();

        const busy = ref(false);
        const form = reactive({
            group_virtual_path: '',
            master_image_id: '',
        });

        const $v = useVuelidate({
            group_virtual_path: {
                required,
            },
            master_image_id: {
                required,
            },
        }, form, {
            $scope: false,
        });

        const masterImageEntity = ref<MasterImage | null>(null);

        const isVirtualGroupPathDefined = computed(() => !!form.group_virtual_path &&
                form.group_virtual_path.length > 0);

        const imageQuery = computed(() => ({
            filters: {
                ...(form.group_virtual_path !== '' ? {
                    group_virtual_path: form.group_virtual_path,
                } : {}),
            },
        }));

        const loadImage = wrapFnWithBusyState(busy, async () => {
            if (!form.master_image_id) return;

            if (
                masterImageEntity.value &&
                masterImageEntity.value.id === form.master_image_id
            ) {
                form.group_virtual_path = masterImageEntity.value.group_virtual_path;
                return;
            }

            try {
                masterImageEntity.value = await apiClient.masterImage.getOne(form.master_image_id);
                form.group_virtual_path = masterImageEntity.value.group_virtual_path;
            } catch (e) {
                // ...
            }
        });

        const init = () => {
            if (props.entity) {
                form.master_image_id = props.entity.id;
                form.group_virtual_path = props.entity.group_virtual_path;

                masterImageEntity.value = props.entity;
                return;
            }

            if (entityId.value) {
                form.master_image_id = entityId.value;
            }

            emit('resolved', masterImageEntity.value);
        };

        watch(entityId, (val, oldValue) => {
            if (val && val !== oldValue) {
                init();
                loadImage();
            }
        });

        init();

        const translationsValidation = useTranslationsForNestedValidations($v.value);

        Promise.resolve()
            .then(() => loadImage());

        const itemListNode = ref<null | Record<string, any>>(null);

        const selectGroup = (input: MasterImageGroup | null) => {
            if (!input) {
                form.master_image_id = '';
                form.group_virtual_path = '';

                emit('selected', null); // todo: check
                return;
            }

            const changed = input.virtual_path !== form.group_virtual_path;

            form.group_virtual_path = input.virtual_path;

            if (changed) {
                form.master_image_id = '';

                nextTick(async () => {
                    if (itemListNode.value) {
                        await itemListNode.value.load();
                    }
                });
            }
        };

        const selectImage = (entity: MasterImage | null) => {
            if (entity) {
                form.master_image_id = entity.id;

                emit('selected', entity);
                return;
            }

            emit('selected', null);
            emit('resolved', entity);
        };

        const buildMasterImageVNode = () : VNodeArrayChildren => {
            if (!isVirtualGroupPathDefined.value) {
                return [];
            }

            return [
                h('div', {
                    class: 'col',
                }, [
                    h(MasterImageList, {
                        ref: itemListNode,
                        query: imageQuery.value,
                    }, {
                        [EntityListSlotName.BODY]: (bodyProps: ListBodySlotProps<MasterImage>) => {
                            const options: FormSelectOption[] = bodyProps.data.map((entity) => ({
                                id: entity.id,
                                value: entity.name,
                                disabled: entity.build_status !== ProcessStatus.EXECUTED,
                            }));

                            return buildFormGroup({
                                props: {
                                    key: form.group_virtual_path,
                                },
                                validationMessages: translationsValidation.master_image_id.value,
                                validationSeverity: getSeverity($v.value.master_image_id),
                                label: true,
                                labelContent: [
                                    'Image',
                                    form.master_image_id ?
                                        h('i', { class: 'fa fa-check text-success ms-1' }) :
                                        h(''),
                                ],
                                content: buildFormSelect({
                                    props: {
                                        disabled: props.readonly,
                                    },
                                    value: form.master_image_id,
                                    onChange(input) {
                                        const index = bodyProps.data.findIndex((el) => el.id === input);
                                        if (index !== -1) {
                                            selectImage(bodyProps.data[index]);
                                            return;
                                        }

                                        selectImage(null);
                                    },
                                    options,
                                }),
                            });
                        },
                    }),
                ]),
            ];
        };

        return () => h(
            'div',
            { class: 'row' },
            [
                h(
                    'div',
                    { class: 'col' },
                    [
                        h(MasterImageGroupList, { }, {
                            [EntityListSlotName.BODY]: (bodyProps: ListBodySlotProps<MasterImageGroup>) => {
                                const options : FormSelectOption[] = bodyProps.data.map((entity) => ({
                                    id: entity.virtual_path,
                                    value: entity.virtual_path,
                                }));

                                return buildFormGroup({
                                    validationMessages: translationsValidation.group_virtual_path.value,
                                    validationSeverity: getSeverity($v.value.group_virtual_path),
                                    label: true,
                                    labelContent: [
                                        'Group',
                                        isVirtualGroupPathDefined.value ?
                                            h('i', { class: 'fa fa-check text-success ms-1' }) :
                                            h(''),
                                    ],
                                    content: buildFormSelect({
                                        props: {
                                            disabled: props.readonly,
                                        },
                                        value: form.group_virtual_path,
                                        onChange(input) {
                                            const index = bodyProps.data.findIndex((el) => el.virtual_path === input);
                                            if (index > -1) {
                                                selectGroup(bodyProps.data[index]);
                                                return;
                                            }

                                            selectGroup(null);
                                        },
                                        options,
                                    }),
                                });
                            },
                        }),
                    ],
                ),
                buildMasterImageVNode(),
            ],
        );
    },
});
