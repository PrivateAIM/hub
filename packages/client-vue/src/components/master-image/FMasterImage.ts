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
    MasterImage,
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

const FMasterImage = defineComponent({
    props: defineEntityManagerProps<MasterImage>(),
    emits: defineEntityManagerEvents<MasterImage>(),
    slots: Object as SlotsType<EntityManagerSlotsType<MasterImage>>,
    async setup(props, setup) {
        const manager = createEntityManager({
            type: `${DomainType.MASTER_IMAGE}`,
            setup,
            props,
        });

        await manager.resolve();

        return () => manager.render();
    },
});

export {
    FMasterImage,
};
