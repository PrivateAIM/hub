/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ASearch } from '@authup/client-web-kit';
import { getSeverity, useTranslationsForNestedValidations } from '@ilingo/vuelidate';
import type { MasterImage } from '@privateaim/core-kit';
import {
    DomainType,
    MasterImageCommand,
} from '@privateaim/core-kit';
import { buildFormGroup, buildFormInput } from '@vuecs/form-controls';
import type { ListHeaderSlotProps } from '@vuecs/list-controls';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import {
    defineComponent, h, reactive, ref,
} from 'vue';
import { EntityListSlotName, injectCoreHTTPClient, wrapFnWithBusyState } from '../../core';
import EntityDelete from '../EntityDelete';
import MasterImageList from './FMasterImages';

export default defineComponent({
    components: { EntityDelete, MasterImageList },
    emits: ['executed', 'failed'],
    setup(props, { emit }) {
        const apiClient = injectCoreHTTPClient();
        const busy = ref(false);
        const itemList = ref<null | Record<string, any>>(null);

        const form = reactive({
            branch: 'master',
        });

        const $v = useVuelidate({
            branch: {
                required,
            },
        }, form);

        const syncMasterImages = wrapFnWithBusyState(busy, async () => {
            if ($v.value.$invalid) return;

            try {
                await apiClient.masterImage
                    .runCommand(MasterImageCommand.SYNC, form);

                emit('executed');
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        const handleDeleted = async (data: MasterImage) => {
            if (itemList.value) {
                itemList.value.handleDeleted(data.id);
            }
        };

        const translationsValidation = useTranslationsForNestedValidations($v.value);

        return () => h(
            'div',
            [
                h('p', [
                    'The master images and groups are extracted from the GitHub repository after executing the sync command and are then transferred to the database.' +
                    ' ' +
                    'In addition, the master images are built and transferred to all registered registry instances.',
                ]),
                buildFormGroup({
                    validationMessages: translationsValidation.branch.value,
                    validationSeverity: getSeverity($v.value.branch),
                    labelContent: 'Branch',
                    content: buildFormInput({
                        value: form.branch,
                        onChange(input) {
                            form.branch = input;
                        },
                    }),
                }),
                h('div', { class: 'mb-1' }, [
                    h('button', {
                        type: 'button',
                        disabled: busy.value || $v.value.$invalid,
                        class: 'btn btn-xs btn-success',
                        onClick(event: any) {
                            event.preventDefault();

                            return syncMasterImages();
                        },
                    }, [
                        h('i', { class: 'fa fa-sync me-1' }),
                        'Sync',
                    ]),
                ]),

                h(MasterImageList, {
                    ref: itemList,
                    scopedSlots: {
                        [EntityListSlotName.HEADER]: (props: ListHeaderSlotProps<MasterImage>) => [
                            h(ASearch, {
                                load: props.load,
                                meta: props.meta,
                                busy: props.busy,
                            }),
                            h('strong', ['Overview']),
                        ],
                        [EntityListSlotName.ITEM_ACTIONS]: (props : { data: MasterImage }) => h(EntityDelete, {
                            class: 'btn btn-xs btn-danger',
                            elementType: 'button',
                            entityId: props.data.id,
                            entityType: DomainType.MASTER_IMAGE,
                            withText: false,
                            onDeleted(item: MasterImage) {
                                return handleDeleted(item);
                            },
                        }),
                    },
                }),
            ],
        );
    },
});
