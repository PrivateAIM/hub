/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type {
    Project,
} from '@privateaim/core-kit';
import {
    DomainType,
} from '@privateaim/core-kit';
import type { SlotsType } from 'vue';
import { defineComponent, h } from 'vue';
import type { ListSlotsType } from '../../core';
import { createList, defineListEvents, defineListProps } from '../../core';
import FDisplayName from '../FDisplayName';

const FProjects = defineComponent({
    props: {
        ...defineListProps<Project>(),
        realmId: {
            type: String,
            default: undefined,
        },
    },
    emits: defineListEvents<Project>(),
    slots: Object as SlotsType<ListSlotsType<Project>>,
    setup(props, setup) {
        const { render, setDefaults } = createList({
            type: `${DomainType.PROJECT}`,
            props,
            setup,
        });

        setDefaults({
            item: {
                content(item, itemProps, slotContent) {
                    if (slotContent.slot) {
                        return slotContent.slot;
                    }

                    return [
                        slotContent.icon,
                        h(FDisplayName, {
                            name: item.name,
                            displayName: item.display_name,
                        }),
                        slotContent.actions,
                    ];
                },
            },

            noMore: { content: 'No more projects available...' },
        });

        return () => render();
    },
});

export {
    FProjects,
};
