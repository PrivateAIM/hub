/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import {
    ARealms,
} from '@authup/client-web-kit';
import { useFieldValidation } from '@ilingo/validup-vue';
import { useValidup } from '@validup/vue';
import type { Severity } from '@validup/vue';
import { createValidator } from '@validup/zod';
import { z } from 'zod';
import type { Node, Registry } from '@privateaim/core-kit';
import {
    DomainType,
    NodeType,
    NodeValidator,
} from '@privateaim/core-kit';
import { ValidatorGroup } from '@privateaim/kit';
import { VCButton } from '@vuecs/button';
import { extend } from '@vuecs/core';
import {
    VCFormCheckbox,
    VCFormGroup,
    VCFormInput,
    VCFormSelect,
} from '@vuecs/forms';
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
    buildFormSubmit,
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
        /**
         * Form-level validator. The shared {@link NodeValidator} keeps
         * `realm_id` optional on CREATE (the server defaults it from the
         * actor realm), but the form requires an explicit realm selection —
         * the pre-migration UI contract. `mount()` appends, so this rule
         * runs in addition to the base ones.
         */
        class NodeFormValidator extends NodeValidator {
            protected override initialize() {
                super.initialize();

                this.mount(
                    'realm_id',
                    { group: ValidatorGroup.CREATE },
                    createValidator(z.uuid()),
                );
            }
        }

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
            new NodeFormValidator(),
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


        return () => {
            const VCIcon = resolveComponent('VCIcon');
            let realm : VNodeArrayChildren = [];
            if (!isRealmLocked.value) {
                realm = [
                    h(
                        ARealms,
                        {},
                        {
                            [EntityListSlotName.BODY]: (props: ListBodySlotProps<Node>) => h(
                                VCFormGroup,
                                {
                                    label: true,
                                    labelContent: 'Realms',
                                    validationMessages: realmValidation.messages,
                                    validationSeverity: toSeverity(realmValidation.severity),
                                },
                                {
                                    default: () => h(VCFormSelect, {
                                        modelValue: form.realm_id,
                                        'onUpdate:modelValue': (input: unknown) => {
                                            form.realm_id = input as string;
                                        },
                                        options: props.data.map((item) => ({
                                            value: item.id,
                                            label: item.name ?? String(item.id),
                                        })),
                                    }),
                                },
                            ),
                        },
                    ),
                    h('hr'),
                ];
            }

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
                        modelValue: $v.fields.name.$model.value == null ? '' : String($v.fields.name.$model.value),
                        'onUpdate:modelValue': (input: string) => {
                            $v.fields.name.$model.value = input;
                        },
                    }),
                },
            );

            const type = h(
                VCFormGroup,
                {
                    label: true,
                    labelContent: 'Type',
                    validationMessages: typeValidation.messages,
                    validationSeverity: toSeverity(typeValidation.severity),
                },
                {
                    default: () => h(VCFormSelect, {
                        modelValue: form.type,
                        'onUpdate:modelValue': (input: unknown) => {
                            form.type = input as NodeType;
                        },
                        options: Object.values(NodeType).map((type) => ({
                            value: type,
                            label: typeof type === 'string' ? type : String(type),
                        })),
                    }),
                },
            );

            const externalName = h(
                VCFormGroup,
                {
                    label: true,
                    labelContent: 'External Name',
                    validationMessages: externalNameValidation.messages,
                    validationSeverity: toSeverity(externalNameValidation.severity),
                },
                {
                    default: () => h(VCFormInput, {
                        modelValue: form.external_name == null ? '' : String(form.external_name),
                        'onUpdate:modelValue': (input: string) => {
                            form.external_name = input;
                        },
                    }),
                },
            );

            const hidden = h(
                VCFormGroup,
                {
                    label: true,
                    labelContent: 'Visibility',
                    validationMessages: hiddenValidation.messages,
                    validationSeverity: toSeverity(hiddenValidation.severity),
                },
                {
                    default: () => h(VCFormCheckbox, {
                        modelValue: !!form.hidden,
                        'onUpdate:modelValue': (input: boolean) => {
                            form.hidden = input;
                        },
                        labelContent: 'Hide for project/analysis selection?',
                        themeClass: { group: extend('inline-flex items-center gap-2') },
                    }),
                },
            );

            const registry : VNodeArrayChildren = [
                h(
                    VCFormGroup,
                    {
                        label: true,
                        labelContent: 'Registry',
                    },
                    {
                        default: () => h(RegistryList, {}, {
                            [EntityListSlotName.ITEM_ACTIONS]: (props: ListItemSlotProps<Registry>) => h(VCButton, {
                                disabled: props.busy,
                                size: 'xs',
                                color: form.registry_id === props.data.id ? 'warning' : 'neutral',
                                onClick($event: any) {
                                    $event.preventDefault();

                                    toggleFormData('registry_id', props.data.id);
                                },
                            }, () => [
                                h(VCIcon, { name: form.registry_id === props.data.id ? 'fa6-solid:minus' : 'fa6-solid:plus' }),
                            ]),
                        }),
                    },
                ),
            ];

            const submitNode = buildFormSubmit({
                submit,
                busy: busy.value,
                isEditing: !!manager.data.value,
                invalid: $v.$invalid.value,
            });

            return h('div', [
                h('div', { class: 'flex flex-wrap -mx-2' }, [
                    h('div', { class: 'flex-1 basis-0 px-2' }, [
                        realm,
                        name,
                        h('hr'),
                        externalName,
                        h('hr'),
                        registry,

                    ]),
                    h('div', { class: 'flex-1 basis-0 px-2' }, [
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
