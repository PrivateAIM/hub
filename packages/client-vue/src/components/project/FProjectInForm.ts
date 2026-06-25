/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useFieldValidation } from '@ilingo/validup-vue';
import { useValidup } from '@validup/vue';
import type { Severity } from '@validup/vue';
import type { ProjectNode } from '@privateaim/core-kit';
import {
    DomainType,
    ProjectNodeApprovalStatus,
    ProjectNodeValidator,
} from '@privateaim/core-kit';
import { ValidatorGroup } from '@privateaim/kit';
import { VCAlert } from '@vuecs/elements';
import {
    VCFormGroup,
    VCFormSelect,
    VCFormTextarea,
} from '@vuecs/forms';
import {
    defineComponent,
    h,
    reactive,
    ref,
    watch,
} from 'vue';
import type { PropType } from 'vue';
import { useUpdatedAt } from '../../composables';
import {
    buildFormSubmit,
    createEntityManager,
    initFormAttributesFromSource,
    wrapFnWithBusyState,
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

        const updatedAt = useUpdatedAt(props.entity);

        const manager = createEntityManager({
            type: `${DomainType.PROJECT_NODE}`,
            setup,
            props,
        });

        const $v = useValidup(
            new ProjectNodeValidator(),
            form,
            { group: ValidatorGroup.UPDATE },
        );

        const commentValidation = useFieldValidation($v.fields.comment);
        const approvalStatusValidation = useFieldValidation($v.fields.approval_status);

        const toSeverity = (input: Severity) => (input === 'error' || input === 'warning' ? input : undefined);

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
            if ($v.$invalid.value) return;

            await manager.createOrUpdate(form);
        });


        return () => {
            const comment = h(
                VCFormGroup,
                {
                    label: true,
                    labelContent: 'Comment',
                    validationMessages: commentValidation.messages,
                    validationSeverity: toSeverity(commentValidation.severity),
                },
                {
                    default: () => h(VCFormTextarea, {
                        modelValue: form.comment == null ? '' : String(form.comment),
                        'onUpdate:modelValue': (input: string) => {
                            form.comment = input;
                        },
                        rows: 4,
                        placeholder: 'Write a comment why you want to approve or either reject the project...',
                    }),
                },
            );

            const status = h(
                VCFormGroup,
                {
                    label: true,
                    labelContent: 'Status',
                    validationMessages: approvalStatusValidation.messages,
                    validationSeverity: toSeverity(approvalStatusValidation.severity),
                },
                {
                    default: () => h(VCFormSelect, {
                        modelValue: form.approval_status,
                        'onUpdate:modelValue': (input: unknown) => {
                            form.approval_status = input as ProjectNodeApprovalStatus;
                        },
                        options: options.map((option) => ({
                            value: option,
                            label: typeof option === 'string' ? option : String(option),
                        })),
                    }),
                },
            );

            const submitNode = buildFormSubmit({
                submit,
                busy: busy.value,
                isEditing: !!manager.data.value,
                invalid: $v.$invalid.value,
            });

            return h(
                'div',
                [
                    h(VCAlert, {
                        color: 'info', 
                        variant: 'soft', 
                        size: 'sm', 
                        class: 'mb-3', 
                    }, () => [
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
