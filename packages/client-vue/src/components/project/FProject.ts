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
    Project,
} from '@privateaim/core-kit';
import type { SlotsType } from 'vue';
import {
    defineComponent,
} from 'vue';
import type {
    EntityManagerSlotsType,
} from '../../core';
import {
    createEntityManager,
    defineEntityManagerEvents,
    defineEntityManagerProps,
} from '../../core';

const FProject = defineComponent({
    props: defineEntityManagerProps<Project>(),
    emits: defineEntityManagerEvents<Project>(),
    slots: Object as SlotsType<EntityManagerSlotsType<Project>>,
    async setup(props, setup) {
        const manager = createEntityManager({
            type: `${DomainType.PROJECT}`,
            setup,
            props,
        });

        await manager.resolve();

        return () => manager.render();
    },
});

export {
    FProject,
};
