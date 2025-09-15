/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { DomainType } from '@privateaim/core-kit';
import type {
    AnalysisBucketFile,
} from '@privateaim/core-kit';
import type { FiltersBuildInput } from 'rapiq';
import type { SlotsType } from 'vue';
import { computed, defineComponent } from 'vue';
import type { ListSlotsType } from '../../core';
import { createList, defineListEvents, defineListProps } from '../../core';

const FAnalysisBucketFiles = defineComponent({
    props: {
        ...defineListProps<AnalysisBucketFile>(),
        realmId: {
            type: String,
            default: undefined,
        },
    },
    emits: defineListEvents<AnalysisBucketFile>(),
    slots: Object as SlotsType<ListSlotsType<AnalysisBucketFile>>,
    setup(props, setup) {
        // todo: include sort

        const filters = computed<FiltersBuildInput<AnalysisBucketFile>>(
            () => {
                if (props.query) {
                    return props.query.filters;
                }

                return {} as FiltersBuildInput<AnalysisBucketFile>;
            },
        );

        const canHandleEventData = (item: AnalysisBucketFile) => {
            console.log('bucket_id check', item, filters.value.bucket_id);
            console.log(item.bucket_id === filters.value.bucket_id);
            if (filters.value.bucket_id) {
                console.log('bucket_id check');
                return item.bucket_id === filters.value.bucket_id;
            }

            console.log('analysis_id check', item.analysis_id, filters.value.analysis_id);
            console.log(item.analysis_id === filters.value.analysis_id);
            if (filters.value.analysis_id) {
                return item.analysis_id === filters.value.analysis_id;
            }

            if (filters.value.realm_id) {
                return item.realm_id === filters.value.realm_id;
            }

            return true;
        };

        const {
            render,
            setDefaults,
        } = createList({
            type: `${DomainType.ANALYSIS_BUCKET_FILE}`,
            props,
            setup,
            socket: {
                processEvent(event) {
                    const outcome = canHandleEventData(event.data);
                    console.log(outcome);
                    return outcome;
                },
            },
        });

        setDefaults({
            noMore: {
                content: 'No more analysis bucket files available...',
            },
        });

        return () => render();
    },
});

export {
    FAnalysisBucketFiles,
};
