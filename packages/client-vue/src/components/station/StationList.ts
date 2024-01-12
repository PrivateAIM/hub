/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { DomainType } from '@personalhealthtrain/core';
import type { Node } from '@personalhealthtrain/core';
import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
import { createList, defineListEvents, defineListProps } from '../../core';
import type { ListSlotsType } from '../../core';

export default defineComponent({
    props: defineListProps<Node>(),
    slots: Object as SlotsType<ListSlotsType<Node>>,
    emits: defineListEvents<Node>(),
    setup(props, setup) {
        const { render, setDefaults } = createList({
            type: `${DomainType.NODE}`,
            props,
            setup,
            query: {
                sort: {
                    name: 'ASC',
                },
            },
        });

        setDefaults({
            noMore: {
                content: 'No more stations available...',
            },
        });

        return () => render();
    },
});
