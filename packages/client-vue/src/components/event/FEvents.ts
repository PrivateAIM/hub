/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type {
    Event,
} from '@privateaim/core-kit';
import {
    DomainType,
    buildDomainChannelName,
} from '@privateaim/core-kit';
import type { BuildInput } from 'rapiq';
import type { PropType } from 'vue';
import {
    defineComponent,
} from 'vue';
import { createList } from '../../core';

export default defineComponent({
    props: {
        query: {
            type: Object as PropType<BuildInput<Event>>,
        },
    },
    setup(props, setup) {
        const {
            render,
            setDefaults,
        } = createList({
            type: `${DomainType.EVENT}`,
            socket: {
                processEvent(event) {
                    return event.meta.roomName !== buildDomainChannelName(DomainType.EVENT);
                },
            },
            props,
            setup,
            query: () => ({
                ...props.query,
                sort: {
                    created_at: 'ASC',
                },
            } satisfies BuildInput<Event>),
        });

        setDefaults({
            noMore: {
                content: 'No more events available...',
            },
        });

        return () => render();
    },
});
