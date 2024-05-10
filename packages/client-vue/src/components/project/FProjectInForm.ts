/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildFormSubmitWithTranslations, createFormSubmitTranslations } from '@authup/client-web-kit';
import { getSeverity, useTranslationsForNestedValidations } from '@ilingo/vuelidate';
import type { ProjectNode } from '@privateaim/core';
import { DomainType, ProjectNodeApprovalStatus } from '@privateaim/core';
import {
    buildFormGroup, buildFormInput, buildFormSelect,
} from '@vuecs/form-controls';
import useVuelidate from '@vuelidate/core';
import { maxLength, minLength, required } from '@vuelidate/validators';
import {
    defineComponent, h, reactive, ref, watch,
} from 'vue';
import type { PropType } from 'vue';
import { useUpdatedAt } from '../../composables';
import {
    createEntityManager, initFormAttributesFromSource, wrapFnWithBusyState,
} from '../../core';

const FProjectInForm = defineComponent({
    props: {
        entity: {
            type: Object as PropType<ProjectNode>,
            required: true,
        },
    },
    setup(props, setup) {
        const busy = ref(false);
        const form = reactive({
            comment: '',
            approval_status: '' as ProjectNodeApprovalStatus,
        });

        const options = [
            ProjectNodeApprovalStatus.APPROVED,
            ProjectNodeApprovalStatus.REJECTED,
        ];

        const $v = useVuelidate({
            comment: {
                minLength: minLength(5),
                maxLength: maxLength(2048),
            },
            approval_status: {
                required,
            },
        }, form);

        const updatedAt = useUpdatedAt(props.entity);

        const manager = createEntityManager({
            type: `${DomainType.PROJECT_NODE}`,
            setup,
            props,
        });

        function initForm() {
            initFormAttributesFromSource(form, manager.data.value);
        }

        watch(updatedAt, (val, oldVal) => {
            if (val && val !== oldVal) {
                manager.data.value = props.entity;

                initForm();
            }
        });

        const submit = wrapFnWithBusyState(busy, async () => {
            if ($v.value.$invalid) return;

            await manager.createOrUpdate(form);
        });

        const translationsValidation = useTranslationsForNestedValidations($v.value);
        const translationsSubmit = createFormSubmitTranslations();

        return () => {
            const comment = buildFormGroup({
                validationMessages: translationsValidation.comment.value,
                validationSeverity: getSeverity($v.value.comment),
                label: true,
                labelContent: 'Comment',
                content: buildFormInput({
                    value: form.comment,
                    onChange(input) {
                        form.comment = input;
                    },
                    props: {
                        placeholder: 'Write a comment why you want to approve or either reject the project...',
                    },
                }),
            });

            const status = buildFormGroup({
                validationMessages: translationsValidation.approval_status.value,
                validationSeverity: getSeverity($v.value.approval_status),
                label: true,
                labelContent: 'Status',
                content: buildFormSelect({
                    value: form.approval_status,
                    onChange(input) {
                        form.approval_status = input;
                    },
                    options: options.map((option) => ({
                        id: option,
                        value: option,
                    })),
                }),
            });

            const submitNode = buildFormSubmitWithTranslations({
                submit,
                busy: busy.value,
                isEditing: !!manager.data.value,
                invalid: $v.value.$invalid,
            }, translationsSubmit);

            return h(
                'div',
                [
                    h('div', { class: 'alert alert-sm alert-info' }, [
                        'You have to approve the project, so the project owner can target you as a node for the analysis.',
                    ]),
                    comment,
                    status,
                    h('hr'),
                    submitNode,
                ],
            );
        };
    },
});

export {
    FProjectInForm,
};
