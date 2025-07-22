/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { AnalysisLog } from '@privateaim/core-kit';
import {
    computed, defineComponent, h, toRef,
} from 'vue';
import type {
    PropType,
} from 'vue';
import type { Log } from '@privateaim/kit';
import { omitLogProperties, pickLogProperties } from '@privateaim/kit';
import { FLog } from '../log';

export default defineComponent({
    props: {
        index: {
            type: Number,
            default: 0,
        },
        entity: {
            type: Object as PropType<AnalysisLog>,
            required: true,
        },
    },
    setup(props) {
        const entity = toRef(props, 'entity');
        const entityNormalized = computed<Log>(() => {
            const labels = omitLogProperties(entity.value);

            return {
                ...pickLogProperties(entity.value),
                labels,
            } satisfies Log;
        });

        return () => h(FLog, {
            entity: entityNormalized.value,
            index: props.index,
        });
    },
});
