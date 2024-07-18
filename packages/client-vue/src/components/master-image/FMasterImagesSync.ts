/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ASearch } from '@authup/client-web-kit';
import type { MasterImage } from '@privateaim/core-kit';
import {
    DomainType,
    MasterImageCommand,
} from '@privateaim/core-kit';
import type { ListHeaderSlotProps } from '@vuecs/list-controls';
import {
    defineComponent, h, ref,
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

        const syncMasterImages = wrapFnWithBusyState(busy, async () => {
            try {
                await apiClient.masterImage
                    .runCommand(MasterImageCommand.SYNC);

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

        return () => h(
            'div',
            [
                h('p', [
                    'The master images and groups are extracted from the git repository after executing the sync command and are then transferred to the database.' +
                    ' ' +
                    'In addition, the master images are built and transferred to all registered registry instances.',
                ]),
                h('div', { class: 'mb-1' }, [
                    h('button', {
                        type: 'button',
                        disabled: busy.value,
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
