/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DomainType,
} from '@privateaim/core-kit';
import type {
    Analysis,
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
    props: defineEntityManagerProps<Analysis>(),
    emits: defineEntityManagerEvents<Analysis>(),
    slots: Object as SlotsType<EntityManagerSlotsType<Analysis>>,
    async setup(props, setup) {
        const manager = createEntityManager({
            type: `${DomainType.ANALYSIS}`,
            setup,
            props,
        });

        await manager.resolve();

        return () => manager.render();
    },
});
