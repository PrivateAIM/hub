/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type {
    Project,
} from '@privateaim/core';
import {
    DomainType,
} from '@privateaim/core';
import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
import type { ListSlotsType } from '../../core';
import { createList, defineListEvents, defineListProps } from '../../core';

const FProjects = defineComponent({
    props: {
        ...defineListProps<Project>(),
        realmId: {
            type: String,
            default: undefined,
        },
    },
    slots: Object as SlotsType<ListSlotsType<Project>>,
    emits: defineListEvents<Project>(),
    setup(props, setup) {
        const { render, setDefaults } = createList({
            type: `${DomainType.PROJECT}`,
            props,
            setup,
        });

        setDefaults({
            noMore: {
                content: 'No more projects available...',
            },
        });

        return () => render();
    },
});

export {
    FProjects,
};
