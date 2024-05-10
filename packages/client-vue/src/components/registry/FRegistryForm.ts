/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildFormSubmitWithTranslations, createFormSubmitTranslations } from '@authup/client-web-kit';
import { getSeverity, useTranslationsForNestedValidations } from '@ilingo/vuelidate';
import type { Registry } from '@privateaim/core';
import { DomainType } from '@privateaim/core';
import {
    buildFormGroup, buildFormInput,
} from '@vuecs/form-controls';
import useVuelidate from '@vuelidate/core';
import { maxLength, minLength, required } from '@vuelidate/validators';
import {
    defineComponent, h, reactive, ref, watch,
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

        const $v = useVuelidate({
            name: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(128),
            },
            host: {
                required,
                maxLength: maxLength(512),
            },
            account_name: {
                inLength: minLength(3),
                maxLength: maxLength(256),
            },
            account_secret: {
                minLength: minLength(3),
                maxLength: maxLength(256),
            },
        }, form);

        const updatedAt = useUpdatedAt(props.entity);

        const manager = createEntityManager({
            type: `${DomainType.REGISTRY}`,
            setup,
            props,
        });

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
            if ($v.value.$invalid) {
                return;
            }

            await manager.createOrUpdate(form);
        });

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
                    props: {
                        placeholder: '...',
                    },
                    onChange(input) {
                        form.name = input;
                    },
                }),
            });

            const host = buildFormGroup({
                validationMessages: translationsValidation.host.value,
                validationSeverity: getSeverity($v.value.host),
                label: true,
                labelContent: 'Host',
                content: buildFormInput({
                    value: form.host,
                    onChange(input) {
                        form.host = input;
                    },
                    props: {
                        placeholder: 'e.g. ghcr.io',
                    },
                }),
            });

            const accountName = buildFormGroup({
                validationMessages: translationsValidation.account_name.value,
                validationSeverity: getSeverity($v.value.account_name),
                label: true,
                labelContent: 'Account Name',
                content: buildFormInput({
                    value: form.account_name,
                    props: {
                        placeholder: '...',
                    },
                    onChange(input) {
                        form.account_name = input;
                    },
                }),
            });

            const accountSecret = buildFormGroup({
                validationMessages: translationsValidation.account_secret.value,
                validationSeverity: getSeverity($v.value.account_secret),
                label: true,
                labelContent: 'Account Secret',
                content: buildFormInput({
                    value: form.account_secret,
                    props: {
                        placeholder: '...',
                    },
                    onChange(input) {
                        form.account_secret = input;
                    },
                }),
            });

            const submitNode = buildFormSubmitWithTranslations({
                submit,
                busy: busy.value,
                isEditing: !!manager.data.value,
                invalid: $v.value.$invalid,
            }, translationsSubmit);

            return h('form', [
                h('div', { class: 'row' }, [
                    h('div', { class: 'col' }, [
                        h('h6', [
                            h('i', { class: 'fas fa-infinity pe-1' }),
                            'General',
                        ]),
                        name,
                        host,
                    ]),
                    h('div', { class: 'col' }, [
                        h('h6', [
                            h('i', { class: 'fas fa-robot pe-1' }),
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
