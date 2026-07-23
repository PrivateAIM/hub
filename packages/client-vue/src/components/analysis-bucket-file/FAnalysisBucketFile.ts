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
import type { PropType, SlotsType } from 'vue';
import type { EntityManagerSlotsType } from '../../core';
import {
    createEntityManager,
    defineEntityManagerEvents,
} from '../../core';

export default defineComponent({
    // AnalysisBucketFile is the deepest node in the cyclic entity graph
    // (bucket-file → bucket → analysis → project → nodes → …); the generic
    // defineEntityManagerProps query surfaces (even depth-bounded) blow past
    // TS's union-representation limit (TS2590) for it. This component only ever
    // resolves by entity/entityId, so declare just those.
    props: {
        entity: { type: Object as PropType<AnalysisBucketFile> },
        entityId: { type: String },
    },
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
