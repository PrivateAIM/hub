/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type {
    AnalysisLog,
} from '@privateaim/core-kit';
import type { ListItemSlotProps } from '@vuecs/list-controls';
import { buildList } from '@vuecs/list-controls';
import type { Ref } from 'vue';
import {
    defineComponent,
    h, nextTick, ref,
} from 'vue';
import { injectCoreHTTPClient } from '../../core';
import FAnalysisLog from './FAnalysisLog';

export default defineComponent({
    props: {
        entityId: {
            type: String,
            required: true,
        },
        realmId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, setup) {
        const rootNode = ref<null | HTMLElement>(null);

        const scrollToLastLine = (total: number) => {
            if (!rootNode.value) {
                return;
            }

            const el = rootNode.value.getElementsByClassName(`line-${total}`)[0];

            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        };

        const httpClient = injectCoreHTTPClient();

        const busy = ref(false);
        const total = ref(0);
        const items : Ref<AnalysisLog[]> = ref([]);

        const load = async (time?: string | bigint) => {
            const response = await httpClient.analysisLog.getMany({
                filter: {
                    analysis_id: props.entityId,
                    ...(time ? { time: `>${time}` } : {}),
                },
            });

            items.value.push(...response.data);

            if (response.meta.total > items.value.length) {
                return load(items.value[items.value.length - 1].time);
            }

            total.value = response.meta.total;

            nextTick(() => {
                scrollToLastLine(items.value.length);
            });

            return Promise.resolve();
        };

        Promise.resolve()
            .then(() => { busy.value = true; })
            .then(() => load())
            .then(() => { busy.value = false; });

        return () => h('div', {
            ref: rootNode,
            class: 'log-container',
        }, [
            h('div', {
                class: 'log-body',
            }, [
                buildList({
                    busy: busy.value,
                    data: items.value,
                    slotItems: setup.slots,
                    noMore: {
                        content: 'No more logs available...',
                    },
                    total: total.value,
                    meta: {
                        total: total.value,
                    },
                    body: {
                        item: {
                            content(item: AnalysisLog, slotProps: ListItemSlotProps<AnalysisLog>) {
                                return h(
                                    FAnalysisLog,
                                    {
                                        entity: item,
                                        index: slotProps.index,
                                        onDeleted() {
                                            if (slotProps && slotProps.deleted) {
                                                slotProps.deleted(item);
                                            }
                                        },
                                        onUpdated: (e: AnalysisLog) => {
                                            if (slotProps && slotProps.updated) {
                                                slotProps.updated(e);
                                            }
                                        },
                                    },
                                );
                            },
                        },
                    },
                }),
            ]),
        ]);
    },
});
