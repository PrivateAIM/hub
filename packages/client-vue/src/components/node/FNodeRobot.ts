/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityManagerSlotProps } from '@authup/client-web-kit';
import { ARobot, buildFormSubmitWithTranslations, createFormSubmitTranslations } from '@authup/client-web-kit';
import { getSeverity, useTranslationsForNestedValidations } from '@ilingo/vuelidate';
import type { PropType } from 'vue';
import { defineComponent, h, reactive } from 'vue';
import type { Node } from '@privateaim/core';
import type { Robot } from '@authup/core-kit';
import { buildFormGroup, buildFormInput } from '@vuecs/form-controls';
import useVuelidate from '@vuelidate/core';
import { maxLength, minLength } from '@vuelidate/validators';
import { initFormAttributesFromSource } from '../../core';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<Node>,
            required: true,
        },
    },
    emits: ['failed'],
    setup(props, { emit }) {
        const form = reactive({
            id: '',
            secret: '',
        });

        const $v = useVuelidate({
            id: {

            },
            secret: {
                minLength: minLength(3),
                maxLength: maxLength(256),
            },
        }, form);

        const translationsValidation = useTranslationsForNestedValidations($v.value);

        return () => h(ARobot, {
            onResolved(entity) {
                if (entity) {
                    initFormAttributesFromSource(form, entity);
                }
            },
            onFailed: (e) => {
                emit('failed', e);
            },
            queryFilters: {
                id: props.entity.robot_id,
            },
        }, {
            default: (slotProps: EntityManagerSlotProps<Robot>) => {
                if (!slotProps.data) {
                    return h(
                        'div',
                        { class: 'alert alert-sm alert-warning' },
                        [
                            'The robot details can not be displayed.',
                        ],
                    );
                }

                const id = buildFormGroup({
                    validationMessages: translationsValidation.id.value,
                    validationSeverity: getSeverity($v.value.id),
                    label: true,
                    labelContent: 'ID',
                    content: buildFormInput({
                        value: form.id,
                        props: {
                            disabled: true,
                        },
                    }),
                });

                const secret = buildFormGroup({
                    validationMessages: translationsValidation.secret.value,
                    validationSeverity: getSeverity($v.value.secret),
                    label: true,
                    labelContent: 'Secret',
                    content: buildFormInput({
                        value: form.secret,
                        props: {
                            placeholder: '...',
                        },
                        onChange(value) {
                            form.secret = value;
                        },
                    }),
                });

                const translationsSubmit = createFormSubmitTranslations();

                const submitNode = buildFormSubmitWithTranslations({
                    submit: () => slotProps.update(form),
                    busy: slotProps.busy,
                    isEditing: !!slotProps.data,
                    invalid: $v.value.$invalid,
                }, translationsSubmit);

                return h('div', [
                    id,
                    secret,
                    submitNode,
                ]);
            },
        });
    },
});
