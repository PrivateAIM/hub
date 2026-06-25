/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useFieldValidation } from '@ilingo/validup-vue';
import { useValidup } from '@validup/vue';
import type { Severity } from '@validup/vue';
import type { Registry } from '@privateaim/core-kit';
import { DomainType, RegistryValidator } from '@privateaim/core-kit';
import { ValidatorGroup } from '@privateaim/kit';
import { VCAlert } from '@vuecs/elements';
import { VCFormGroup, VCFormInput } from '@vuecs/forms';
import {
    computed,
    defineComponent,
    h,
    reactive,
    ref,
    resolveComponent,
    watch,
} from 'vue';
import type {
    PropType,
} from 'vue';
import { useUpdatedAt } from '../../composables';
import {
    buildFormSubmit,
    createEntityManager,
    defineEntityManagerEvents,
    initFormAttributesFromSource,
    wrapFnWithBusyState,
} from '../../core';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<Registry>,
            default: undefined,
        },
    },
    emits: defineEntityManagerEvents<Registry>(),
    setup(props, setup) {
        const busy = ref(false);
        const form = reactive({
            name: '',
            host: '',
            account_name: '',
            account_secret: '',
        });

        const updatedAt = useUpdatedAt(props.entity);

        const manager = createEntityManager({
            type: `${DomainType.REGISTRY}`,
            setup,
            props,
        });

        const $v = useValidup(
            new RegistryValidator(),
            form,
            { group: computed(() => (manager.data.value ? ValidatorGroup.UPDATE : ValidatorGroup.CREATE)) },
        );

        const nameValidation = useFieldValidation($v.fields.name);
        const hostValidation = useFieldValidation($v.fields.host);
        const accountNameValidation = useFieldValidation($v.fields.account_name);
        const accountSecretValidation = useFieldValidation($v.fields.account_secret);

        const toSeverity = (input: Severity) => (input === 'error' || input === 'warning' ? input : undefined);

        const initForm = () => {
            if (!manager.data.value) {
                return;
            }

            initFormAttributesFromSource(form, manager.data.value);
        };

        watch(updatedAt, (val, oldVal) => {
            if (val && val !== oldVal) {
                initForm();
            }
        });

        initForm();

        const submit = wrapFnWithBusyState(busy, async () => {
            if ($v.$invalid.value) {
                return;
            }

            await manager.createOrUpdate(form);
        });


        return () => {
            const VCIcon = resolveComponent('VCIcon');
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
                        placeholder: '...',
                    }),
                },
            );

            const host = h(
                VCFormGroup,
                {
                    label: true,
                    labelContent: 'Host',
                    validationMessages: hostValidation.messages,
                    validationSeverity: toSeverity(hostValidation.severity),
                },
                {
                    default: () => h(VCFormInput, {
                        modelValue: form.host == null ? '' : String(form.host),
                        'onUpdate:modelValue': (input: string) => {
                            form.host = input;
                        },
                        placeholder: 'e.g. ghcr.io',
                    }),
                },
            );

            const accountName = h(
                VCFormGroup,
                {
                    label: true,
                    labelContent: 'Account Name',
                    validationMessages: accountNameValidation.messages,
                    validationSeverity: toSeverity(accountNameValidation.severity),
                },
                {
                    default: () => h(VCFormInput, {
                        modelValue: form.account_name == null ? '' : String(form.account_name),
                        'onUpdate:modelValue': (input: string) => {
                            form.account_name = input;
                        },
                        placeholder: '...',
                    }),
                },
            );

            const accountSecret = h(
                VCFormGroup,
                {
                    label: true,
                    labelContent: 'Account Secret',
                    validationMessages: accountSecretValidation.messages,
                    validationSeverity: toSeverity(accountSecretValidation.severity),
                },
                {
                    default: () => h(VCFormInput, {
                        modelValue: form.account_secret == null ? '' : String(form.account_secret),
                        'onUpdate:modelValue': (input: string) => {
                            form.account_secret = input;
                        },
                        placeholder: '...',
                    }),
                },
            );

            const submitNode = buildFormSubmit({
                submit,
                busy: busy.value,
                isEditing: !!manager.data.value,
                invalid: $v.$invalid.value,
            });

            return h('form', [
                h('div', { class: 'flex flex-wrap -mx-2' }, [
                    h('div', { class: 'flex-1 basis-0 px-2' }, [
                        h('h6', [
                            h(VCIcon, { name: 'fa6-solid:infinity', class: 'pe-1' }),
                            'General',
                        ]),
                        name,
                        host,
                    ]),
                    h('div', { class: 'flex-1 basis-0 px-2' }, [
                        h('h6', [
                            h(VCIcon, { name: 'fa6-solid:robot', class: 'pe-1' }),
                            'Robot',
                        ]),
                        accountName,
                        accountSecret,
                    ]),
                ]),
                h(
                    VCAlert,
                    {
                        color: 'error', 
                        variant: 'soft', 
                        size: 'sm', 
                        class: 'mb-3', 
                    },
                    () => [
                        'It is only possible to register harbor registries > v2.3.0',
                    ],
                ),
                h('hr'),
                submitNode,
            ]);
        };
    },
});
