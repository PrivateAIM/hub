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
import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
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
    slots: Object as SlotsType<ListSlotsType<AnalysisBucketFile>>,
    emits: defineListEvents<AnalysisBucketFile>(),
    setup(props, setup) {
        // todo: include sort

        const {
            render,
            setDefaults,
        } = createList({
            type: `${DomainType.ANALYSIS_BUCKET_FILE}`,
            props,
            setup,
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
