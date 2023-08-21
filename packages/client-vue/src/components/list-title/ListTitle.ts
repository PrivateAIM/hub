/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType, SlotsType } from 'vue';
import { defineComponent } from 'vue';
import type { ListTitleSlotProps } from '@authup/client-vue';
import { buildListTitle } from '@authup/client-vue';

export const ListTitle = defineComponent({
    props: {
        icon: {
            type: Boolean,
            default: true,
        },
        iconPosition: {
            type: String as PropType<'start' | 'end'>,
        },
        iconClass: {
            type: String,
        },
        text: {
            type: String,
        },
    },
    slots: Object as SlotsType<{
        default: ListTitleSlotProps
    }>,
    setup(props, { slots }) {
        return () => buildListTitle({
            slots,
            icon: props.icon,
            iconClass: props.iconClass,
            iconPosition: props.iconPosition,
            text: props.text,
        });
    },
});
