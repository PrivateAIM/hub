/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { ARealms, buildFormSubmitWithTranslations, createFormSubmitTranslations } from '@authup/client-web-kit';
import { getSeverity, useTranslationsForNestedValidations } from '@ilingo/vuelidate';
import type { Node, Registry } from '@privateaim/core';
import {
    DomainType,
    NodeType, alphaNumHyphenUnderscoreRegex,
} from '@privateaim/core';
import {
    buildFormGroup,
    buildFormInput, buildFormInputCheckbox, buildFormSelect,
} from '@vuecs/form-controls';
import type { ListBodySlotProps, ListItemSlotProps } from '@vuecs/list-controls';
import useVuelidate from '@vuelidate/core';
import {
    email, helpers, maxLength, minLength, required,
} from '@vuelidate/validators';
import type {
    PropType, VNodeArrayChildren,
} from 'vue';
import {
    computed, defineComponent, h, reactive, ref, watch,
} from 'vue';
import { useUpdatedAt } from '../../composables';
import {
    EntityListSlotName,
    createEntityManager,
    defineEntityManagerEvents,
    initFormAttributesFromSource,
    wrapFnWithBusyState,
} from '../../core';
import RegistryList from '../registry/FRegistries';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<Node>,
            default: undefined,
        },
        realmId: {
            type: String,
            default: undefined,
        },
        realmName: {
            type: String,
            default: undefined,
        },
    },
    emits: defineEntityManagerEvents<Node>(),
    setup(props, setup) {
        const busy = ref(false);
        const form = reactive({
            name: '',
            external_name: '',
            email: '',
            realm_id: '',
            registry_id: '',
            hidden: false,
            type: NodeType.DEFAULT,
        });

        const $v = useVuelidate({
            name: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(128),
            },
            hidden: {

            },
            realm_id: {
                required,
            },
            registry_id: {
                required,
            },
            external_name: {
                alphaNumHyphenUnderscore: helpers.regex(alphaNumHyphenUnderscoreRegex),
                minLength: minLength(3),
                maxLength: maxLength(64),
            },
            email: {
                minLength: minLength(10),
                maxLength: maxLength(256),
                email,
            },
            type: {
                required,
            },
        }, form);

        const manager = createEntityManager({
            type: `${DomainType.NODE}`,
            setup,
            props,
        });

        const isRealmLocked = computed(() => props.realmId ||
                (manager.data.value && manager.data.value.realm_id));

        const updatedAt = useUpdatedAt(props.entity);

        const initForm = () => {
            initFormAttributesFromSource(form, manager.data.value);

            if (!form.realm_id && props.realmId) {
                form.realm_id = props.realmId;
            }

            if (
                !form.name &&
                (props.realmId || props.realmName)
            ) {
                form.name = (props.realmName || props.realmId) as string;
            }
        };

        initForm();

        watch(updatedAt, (val, oldVal) => {
            if (val && val !== oldVal) {
                initForm();
            }
        });

        const submit = wrapFnWithBusyState(busy, async () => {
            if ($v.value.$invalid) return;

            await manager.createOrUpdate(form as Partial<Node>);
        });

        const toggleFormData = <T extends keyof typeof form>(key: T, id: any) => {
            if (form[key] === id) {
                form[key] = null as any;
            } else {
                form[key] = id;
            }
        };

        const translationsValidation = useTranslationsForNestedValidations($v.value);
        const translationsSubmit = createFormSubmitTranslations();

        return () => {
            let realm : VNodeArrayChildren = [];
            if (!isRealmLocked.value) {
                realm = [
                    h(
                        ARealms,
                        {},
                        {
                            [EntityListSlotName.BODY]: (props: ListBodySlotProps<Node>) => buildFormGroup({
                                validationMessages: translationsValidation.realm_id.value,
                                validationSeverity: getSeverity($v.value.realm_id),
                                label: true,
                                labelContent: 'Realms',
                                content: buildFormSelect({
                                    value: form.realm_id,
                                    onChange(input) {
                                        form.realm_id = input;
                                    },
                                    options: props.data.map((item) => ({
                                        id: item.id,
                                        value: item.name,
                                    })),
                                }),
                            }),
                        },
                    ),
                    h('hr'),
                ];
            }

            const name = buildFormGroup({
                validationMessages: translationsValidation.name.value,
                validationSeverity: getSeverity($v.value.name),
                label: true,
                labelContent: 'Name',
                content: buildFormInput({
                    value: $v.value.name.$model,
                    onChange(input) {
                        $v.value.name.$model = input;
                    },
                }),
            });

            const type = buildFormGroup({
                validationMessages: translationsValidation.type.value,
                validationSeverity: getSeverity($v.value.type),
                label: true,
                labelContent: 'Type',
                content: buildFormSelect({
                    value: form.type,
                    options: Object.values(NodeType).map((type) => ({
                        id: type,
                        value: type,
                    })),
                    onChange(input) {
                        form.type = input;
                    },
                }),
            });

            const externalName = buildFormGroup({
                validationMessages: translationsValidation.external_name.value,
                validationSeverity: getSeverity($v.value.external_name),
                label: true,
                labelContent: 'External Name',
                content: buildFormInput({
                    value: form.external_name,
                    onChange(input) {
                        form.external_name = input;
                    },
                }),
            });

            const emailNode = buildFormGroup({
                validationMessages: translationsValidation.email.value,
                validationSeverity: getSeverity($v.value.email),
                label: true,
                labelContent: 'E-Mail',
                content: buildFormInput({
                    value: form.email,
                    onChange(input) {
                        form.email = input;
                    },
                }),
            });

            const hidden = buildFormGroup({
                validationMessages: translationsValidation.hidden.value,
                validationSeverity: getSeverity($v.value.hidden),
                label: true,
                labelContent: 'Visibility',
                content: buildFormInputCheckbox({
                    groupClass: 'form-switch',
                    value: form.hidden,
                    onChange(input) {
                        form.hidden = input;
                    },
                    labelContent: 'Hide for project/analysis selection?',
                }),
            });

            const registry : VNodeArrayChildren = [
                buildFormGroup({
                    label: true,
                    labelContent: 'Registry',
                    content:
                        h(RegistryList, {}, {
                            [EntityListSlotName.ITEM_ACTIONS]: (props: ListItemSlotProps<Registry>) => h('button', {
                                disabled: props.busy,
                                class: ['btn btn-xs', {
                                    'btn-dark': form.registry_id !== props.data.id,
                                    'btn-warning': form.registry_id === props.data.id,
                                }],
                                onClick($event: any) {
                                    $event.preventDefault();

                                    toggleFormData('registry_id', props.data.id);
                                },
                            }, [
                                h('i', {
                                    class: {
                                        'fa fa-plus': form.registry_id !== props.data.id,
                                        'fa fa-minus': form.registry_id === props.data.id,
                                    },
                                }),
                            ]),
                        }),
                }),
            ];

            const submitNode = buildFormSubmitWithTranslations({
                submit,
                busy: busy.value,
                isEditing: !!manager.data.value,
                invalid: $v.value.$invalid,
            }, translationsSubmit);

            return h('div', [
                h('div', { class: 'row' }, [
                    h('div', {
                        class: 'col',
                    }, [
                        realm,
                        name,
                        h('hr'),
                        externalName,
                        h('hr'),
                        registry,

                    ]),
                    h('div', {
                        class: 'col',
                    }, [
                        type,
                        h('hr'),
                        hidden,
                        h('hr'),
                        emailNode,
                        h('hr'),
                        submitNode,
                    ]),
                ]),
            ]);
        };
    },
});
