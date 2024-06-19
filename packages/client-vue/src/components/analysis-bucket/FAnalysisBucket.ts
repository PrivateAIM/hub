/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucket } from '@privateaim/core-kit';
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
    props: defineEntityManagerProps<AnalysisBucket>(),
    emits: defineEntityManagerEvents<AnalysisBucket>(),
    slots: Object as SlotsType<EntityManagerSlotsType<AnalysisBucket>>,
    async setup(props, setup) {
        const manager = createEntityManager({
            type: `${DomainType.ANALYSIS_BUCKET}`,
            setup,
            props,
        });

        try {
            await manager.resolveOrFail();

            return () => manager.render();
        } catch (e) {
            return () => manager.renderError(e);
        }
    },
});
