/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { DomainType } from '@privateaim/core';
import type {
    Analysis,
} from '@privateaim/core';
import type { SetupContext, SlotsType } from 'vue';
import { defineComponent, h } from 'vue';
import type { ListEventsType, ListSlotsType } from '../../core';
import { createList, defineListEvents, defineListProps } from '../../core';
import { FAnalysisItem } from './FAnalysisItem';

export default defineComponent({
    props: defineListProps<Analysis>(),
    slots: Object as SlotsType<ListSlotsType<Analysis>>,
    emits: {
        ...defineListEvents<Analysis>(),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        executed: (_component: string, _command :string) => true,
    },
    setup(props, setup) {
        const {
            render,
            setDefaults,
            handleUpdated,
            handleDeleted,
        } = createList({
            type: `${DomainType.ANALYSIS}`,
            props,
            setup: setup as unknown as SetupContext<ListEventsType<Analysis>>,
        });

        setDefaults({
            item: {
                content(item) {
                    return h(FAnalysisItem, {
                        entity: item,
                        onDeleted: handleDeleted,
                        onUpdated: handleUpdated,
                        onExecuted(component: string, command: string) {
                            setup.emit('executed', component, command);
                        },
                    });
                },
            },

            noMore: {
                content: 'No more analyses available...',
            },
        });

        return () => render();
    },
});
