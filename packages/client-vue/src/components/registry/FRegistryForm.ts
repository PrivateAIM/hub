/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    buildFormGroup,
    buildFormInput,
    buildFormSubmitWithTranslations,
    createFormSubmitTranslations,
} from '@authup/client-web-kit';
import { useFieldValidation } from '@ilingo/validup-vue';
import { useValidup } from '@validup/vue';
import type { Severity } from '@validup/vue';
import type { Registry } from '@privateaim/core-kit';
import { DomainType, RegistryValidator } from '@privateaim/core-kit';
import { ValidatorGroup } from '@privateaim/kit';
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
                    props: { placeholder: '...' },
                    onChange(input) {
                        form.name = input;
                    },
                }),
            });

            const host = buildFormGroup({
                validationMessages: hostValidation.messages,
                validationSeverity: toSeverity(hostValidation.severity),
                label: true,
                labelContent: 'Host',
                content: buildFormInput({
                    value: form.host,
                    onChange(input) {
                        form.host = input;
                    },
                    props: { placeholder: 'e.g. ghcr.io' },
                }),
            });

            const accountName = buildFormGroup({
                validationMessages: accountNameValidation.messages,
                validationSeverity: toSeverity(accountNameValidation.severity),
                label: true,
                labelContent: 'Account Name',
                content: buildFormInput({
                    value: form.account_name,
                    props: { placeholder: '...' },
                    onChange(input) {
                        form.account_name = input;
                    },
                }),
            });

            const accountSecret = buildFormGroup({
                validationMessages: accountSecretValidation.messages,
                validationSeverity: toSeverity(accountSecretValidation.severity),
                label: true,
                labelContent: 'Account Secret',
                content: buildFormInput({
                    value: form.account_secret,
                    props: { placeholder: '...' },
                    onChange(input) {
                        form.account_secret = input;
                    },
                }),
            });

            const submitNode = buildFormSubmitWithTranslations({
                submit,
                busy: busy.value,
                isEditing: !!manager.data.value,
                invalid: $v.$invalid.value,
            }, translationsSubmit);

            return h('form', [
                h('div', { class: 'row' }, [
                    h('div', { class: 'col' }, [
                        h('h6', [
                            h(VCIcon, { name: 'fa6-solid:infinity', class: 'pe-1' }),
                            'General',
                        ]),
                        name,
                        host,
                    ]),
                    h('div', { class: 'col' }, [
                        h('h6', [
                            h(VCIcon, { name: 'fa6-solid:robot', class: 'pe-1' }),
                            'Robot',
                        ]),
                        accountName,
                        accountSecret,
                    ]),
                ]),
                h(
                    'div',
                    { class: 'alert alert-sm alert-warning alert-danger' },
                    [
                        'It is only possible to register harbor registries > v2.3.0',
                    ],
                ),
                h('hr'),
                submitNode,
            ]);
        };
    },
});
