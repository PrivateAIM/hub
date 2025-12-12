/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucketFile } from '@privateaim/core-kit';
import {
    DomainType,
} from '@privateaim/core-kit';
import {
    defineComponent,
} from 'vue';
import type { SlotsType } from 'vue';
import type { EntityManagerSlotsType } from '../../core';
import {
    createEntityManager,
    defineEntityManagerEvents,
    defineEntityManagerProps,
} from '../../core';

export default defineComponent({
    props: defineEntityManagerProps<AnalysisBucketFile>(),
    emits: defineEntityManagerEvents<AnalysisBucketFile>(),
    slots: Object as SlotsType<EntityManagerSlotsType<AnalysisBucketFile>>,
    async setup(props, setup) {
        const manager = createEntityManager({
            type: `${DomainType.ANALYSIS_BUCKET_FILE}`,
            setup,
            props,
        });

        await manager.resolve();

        return () => manager.render();
    },
});
