/*
 * Copyright (c) 2022-2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
import type { MasterImage } from '@privateaim/core-kit';
import type { ListSlotsType } from '../../core';
import {
    createList,
    defineListEvents,
    defineListProps,
} from '../../core';

/**
 * Free-text search goes through `FSearch` with `MASTER_IMAGE_SEARCH_FIELDS`,
 * which sends `or(contains(name), contains(virtualPath))`. The list itself
 * does not rewrite filters: an equality on `virtualPath` matched only the
 * full path, so a partial term never found anything.
 */
export default defineComponent({
    props: defineListProps<MasterImage>(),
    emits: defineListEvents<MasterImage>(),
    slots: Object as SlotsType<ListSlotsType<MasterImage>>,
    setup(props, ctx) {
        const { render, setDefaults } = createList({
            type: `${DomainType.MASTER_IMAGE}`,
            props,
            setup: ctx,
            query: { sorts: { virtualPath: 'ASC' } },
        });

        setDefaults({
            item: { textPropName: 'virtualPath' },

            noMore: { content: 'No master images yet' },
        });

        return () => render();
    },
});
