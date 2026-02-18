/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
import { hasOwnProperty } from '@privateaim/kit';
import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
import type { MasterImage } from '@privateaim/core-kit';
import type { ListSlotsType } from '../../core';
import {
    createList,
    defineListEvents,
    defineListProps,
} from '../../core';

export default defineComponent({
    props: defineListProps<MasterImage>(),
    emits: defineListEvents<MasterImage>(),
    slots: Object as SlotsType<ListSlotsType<MasterImage>>,
    setup(props, ctx) {
        const { render, setDefaults } = createList({
            type: `${DomainType.MASTER_IMAGE}`,
            props,
            setup: ctx,
            queryFilters: (filters) => {
                if (
                    hasOwnProperty(filters, 'name') &&
                    typeof filters.name === 'string' &&
                    filters.name.length > 0
                ) {
                    filters.virtual_path = filters.name;

                    delete filters.name;
                }
            },
            query: {
                sort: {
                    virtual_path: 'ASC',
                },
            },
        });

        setDefaults({
            item: {
                textPropName: 'virtual_path',
            },

            noMore: {
                content: 'No more master-images available...',
            },
        });

        return () => render();
    },
});
