/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import {
    ARealms,
    buildFormCheckbox,
    buildFormGroup,
    buildFormInput,
    buildFormSelect,
    buildFormSubmitWithTranslations,
    createFormSubmitTranslations,
} from '@authup/client-web-kit';
import { useFieldValidation } from '@ilingo/validup-vue';
import { useValidup } from '@validup/vue';
import type { Severity } from '@validup/vue';
import type { Node, Registry } from '@privateaim/core-kit';
import {
    DomainType,
    NodeType,
    NodeValidator,
} from '@privateaim/core-kit';
import { ValidatorGroup } from '@privateaim/kit';
import type {
    PropType,
    VNodeArrayChildren,
} from 'vue';
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
import type { ListBodySlotProps, ListItemSlotProps } from '../../core';
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
            realm_id: '',
            registry_id: '',
            hidden: false,
            type: NodeType.DEFAULT,
        });

        const manager = createEntityManager({
            type: `${DomainType.NODE}`,
            setup,
            props,
        });

        const $v = useValidup(
            new NodeValidator(),
            form,
            { group: computed(() => (manager.data.value ? ValidatorGroup.UPDATE : ValidatorGroup.CREATE)) },
        );

        const nameValidation = useFieldValidation($v.fields.name);
        const realmValidation = useFieldValidation($v.fields.realm_id);
        const typeValidation = useFieldValidation($v.fields.type);
        const externalNameValidation = useFieldValidation($v.fields.external_name);
        const hiddenValidation = useFieldValidation($v.fields.hidden);

        const toSeverity = (input: Severity) => (input === 'error' || input === 'warning' ? input : undefined);

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
            if ($v.$invalid.value) return;

            await manager.createOrUpdate(form as Partial<Node>);
        });

        const toggleFormData = <T extends keyof typeof form>(key: T, id: any) => {
            if (form[key] === id) {
                form[key] = null as any;
            } else {
                form[key] = id;
            }
        };

        const translationsSubmit = createFormSubmitTranslations();

        return () => {
            const VCIcon = resolveComponent('VCIcon');
            let realm : VNodeArrayChildren = [];
            if (!isRealmLocked.value) {
                realm = [
                    h(
                        ARealms,
                        {},
                        {
                            [EntityListSlotName.BODY]: (props: ListBodySlotProps<Node>) => buildFormGroup({
                                validationMessages: realmValidation.messages,
                                validationSeverity: toSeverity(realmValidation.severity),
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
                validationMessages: nameValidation.messages,
                validationSeverity: toSeverity(nameValidation.severity),
                label: true,
                labelContent: 'Name',
                content: buildFormInput({
                    value: $v.fields.name.$model.value,
                    onChange(input) {
                        $v.fields.name.$model.value = input;
                    },
                }),
            });

            const type = buildFormGroup({
                validationMessages: typeValidation.messages,
                validationSeverity: toSeverity(typeValidation.severity),
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

            const hidden = buildFormGroup({
                validationMessages: hiddenValidation.messages,
                validationSeverity: toSeverity(hiddenValidation.severity),
                label: true,
                labelContent: 'Visibility',
                content: buildFormCheckbox({
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
                                h(VCIcon, { name: form.registry_id === props.data.id ? 'fa6-solid:minus' : 'fa6-solid:plus' }),
                            ]),
                        }),
                }),
            ];

            const submitNode = buildFormSubmitWithTranslations({
                submit,
                busy: busy.value,
                isEditing: !!manager.data.value,
                invalid: $v.$invalid.value,
            }, translationsSubmit);

            return h('div', [
                h('div', { class: 'row' }, [
                    h('div', { class: 'col' }, [
                        realm,
                        name,
                        h('hr'),
                        externalName,
                        h('hr'),
                        registry,

                    ]),
                    h('div', { class: 'col' }, [
                        type,
                        h('hr'),
                        hidden,
                        h('hr'),
                        submitNode,
                    ]),
                ]),
            ]);
        };
    },
});
