/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    buildFormGroup,
    buildFormInput,
    buildFormSelect,
    buildFormSubmitWithTranslations,
    createFormSubmitTranslations,
} from '@authup/client-web-kit';
import { useFieldValidation } from '@ilingo/validup-vue';
import { useValidup } from '@validup/vue';
import type { Severity } from '@validup/vue';
import type { Registry, RegistryProject } from '@privateaim/core-kit';
import {
    DomainType,
    RegistryProjectType,
    RegistryProjectValidator,
} from '@privateaim/core-kit';
import { ValidatorGroup, createNanoID } from '@privateaim/kit';
import type { ListItemSlotProps } from '../../core';
import type { PropType, VNodeArrayChildren } from 'vue';
import {
    computed,
    defineComponent,
    h,
    reactive,
    ref,
    resolveComponent,
    watch,
} from 'vue';
import { useUpdatedAt } from '../../composables';
import {
    EntityListSlotName, 
    createEntityManager, 
    initFormAttributesFromSource, 
    wrapFnWithBusyState,
} from '../../core';
import RegistryList from '../registry/FRegistries';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<RegistryProject>,
            default: undefined,
        },
        registryId: {
            type: String as PropType<Registry['id']>,
            default: undefined,
        },
    },
    emit: ['created', 'updated', 'failed'],
    setup(props, setup) {
        const busy = ref(false);
        const form = reactive({
            external_name: '',
            name: '',
            type: RegistryProjectType.DEFAULT,
            registry_id: '',
        });

        const manager = createEntityManager({
            type: `${DomainType.REGISTRY_PROJECT}`,
            setup,
            props,
        });

        const $v = useValidup(
            new RegistryProjectValidator(),
            form,
            { group: computed(() => (manager.data.value ? ValidatorGroup.UPDATE : ValidatorGroup.CREATE)) },
        );

        const nameValidation = useFieldValidation($v.fields.name);
        const externalNameValidation = useFieldValidation($v.fields.external_name);
        const typeValidation = useFieldValidation($v.fields.type);

        const toSeverity = (input: Severity) => (input === 'error' || input === 'warning' ? input : undefined);

        const types = [
            { id: RegistryProjectType.DEFAULT, value: 'DEFAULT' },
            { id: RegistryProjectType.NODE, value: 'Node' },
            { id: RegistryProjectType.AGGREGATOR, value: 'Aggregator' },
            { id: RegistryProjectType.INCOMING, value: 'Incoming' },
            { id: RegistryProjectType.OUTGOING, value: 'Outgoing' },
            { id: RegistryProjectType.MASTER_IMAGES, value: 'Master-Images' },
        ];

        const isRegistryLocked = computed(
            () => !!props.registryId,
        );

        const isExternalNameUnchanged = computed(() => {
            if (!manager.data.value || !manager.data.value.external_name) {
                return true;
            }

            return manager.data.value.external_name !== form.external_name;
        });

        const toggleForm = (key: keyof typeof form, id: any) => {
            if (form[key] === id) {
                form[key] = null as any;
            } else {
                form[key] = id;
            }
        };

        const generateAlias = () => {
            form.external_name = createNanoID();
        };

        const resetAlias = () => {
            if (!manager.data.value) return;

            form.external_name = manager.data.value.external_name;
        };

        const initFromProperties = () => {
            if (props.registryId) {
                form.registry_id = props.registryId;
            }

            if (typeof manager.data.value === 'undefined') {
                generateAlias();
            }

            initFormAttributesFromSource(form, manager.data.value);
        };

        const updatedAt = useUpdatedAt(props.entity);

        initFromProperties();

        watch(updatedAt, (val, oldValue) => {
            if (val && val !== oldValue) {
                initFromProperties();
            }
        });

        const submit = wrapFnWithBusyState(busy, async () => {
            if ($v.$invalid.value) {
                return;
            }

            await manager.createOrUpdate(form);
        });

        const translationsSubmit = createFormSubmitTranslations();

        return () => {
            const VCIcon = resolveComponent('VCIcon');
            const name = buildFormGroup({
                validationMessages: nameValidation.messages,
                validationSeverity: toSeverity(nameValidation.severity),
                label: true,
                labelContent: 'Name',
                content: buildFormInput({
                    value: form.name,
                    onChange(input) {
                        form.name = input;
                    },
                }),
            });
            const externalName = buildFormGroup({
                validationMessages: externalNameValidation.messages,
                validationSeverity: toSeverity(externalNameValidation.severity),
                label: true,
                labelContent: 'External Name',
                content: buildFormInput({
                    value: form.external_name,
                    onChange(input) {
                        form.external_name = input;
                    },
                }),
            });

            const externalNameHint = h('div', {
                class: ['alert alert-sm', {
                    'alert-danger': !isExternalNameUnchanged.value,
                    'alert-info': isExternalNameUnchanged.value,
                }],
            }, [
                h('div', { class: 'mb-1' }, [
                    (!isExternalNameUnchanged.value ?
                        'If you change the external_name, a new representation will be created in the Registry.' :
                        'If you don\'t want to chose a external_name by your own, you can generate one.'
                    ),
                ]),
                h('button', {
                    class: 'btn btn-xs btn-dark',
                    type: 'button',
                    onClick($event: any) {
                        $event.preventDefault();

                        generateAlias();
                    },
                }, [
                    h(VCIcon, { name: 'fa6-solid:wrench', class: 'pe-1' }),
                    'Generate',
                ]),
                h('button', {
                    class: 'btn btn-xs btn-dark ms-1',
                    type: 'button',
                    disabled: isExternalNameUnchanged.value,
                    onClick($event: any) {
                        $event.preventDefault();

                        resetAlias();
                    },
                }, [
                    h(VCIcon, { name: 'fa6-solid:rotate-left', class: 'pe-1' }),
                    'Reset',
                ]),
            ]);

            const type = buildFormGroup({
                validationMessages: typeValidation.messages,
                validationSeverity: toSeverity(typeValidation.severity),
                label: true,
                labelContent: 'Type',
                content: buildFormSelect({
                    value: form.type,
                    options: types,
                    onChange(input) {
                        form.type = input;
                    },
                }),
            });

            let registry : VNodeArrayChildren = [];

            if (!isRegistryLocked.value) {
                registry = [
                    h('hr'),
                    h(RegistryList, {
                        [EntityListSlotName.ITEM_ACTIONS]: (props: ListItemSlotProps<Registry>) => h('button', {
                            attrs: { disabled: props.busy },
                            class: ['btn btn-xs', {
                                'btn-dark': form.registry_id !== props.data.id,
                                'btn-warning': form.registry_id === props.data.id,
                            }],
                            onClick($event: any) {
                                $event.preventDefault();

                                toggleForm('registry_id', props.data.id);
                            },
                        }, [
                            h(VCIcon, { name: form.registry_id === props.data.id ? 'fa6-solid:minus' : 'fa6-solid:plus' }),
                        ]),
                    }),
                ];
            }

            const submitNode = buildFormSubmitWithTranslations({
                submit,
                busy: busy.value,
                isEditing: !!manager.data.value,
                invalid: $v.$invalid.value,
            }, translationsSubmit);

            return h('form', {
                onSubmit($event: any) {
                    $event.preventDefault();

                    return submit();
                },
            }, [
                type,
                h('hr'),
                name,
                h('hr'),
                externalName,
                externalNameHint,
                registry,
                h('hr'),
                submitNode,
            ]);
        };
    },
});
