/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DomainType,
} from '@privateaim/core';
import type {
    Analysis,
} from '@privateaim/core';
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
    props: defineEntityManagerProps<Analysis>(),
    emits: defineEntityManagerEvents<Analysis>(),
    slots: Object as SlotsType<EntityManagerSlotsType<Analysis>>,
    async setup(props, setup) {
        const manager = createEntityManager({
            type: `${DomainType.ANALYSIS}`,
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
