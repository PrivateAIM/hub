/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType, SlotsType } from 'vue';
import { defineComponent, h } from 'vue';
import { ASearch } from '@authup/client-web-kit';
import type { ListLoadFn, ListMeta } from '../../../core';

export const FSearch = defineComponent({
    props: {
        // todo: add entity-key prop
        icon: { type: Boolean },
        iconPosition: { type: String as PropType<'start' | 'end'> },
        iconClass: { type: String },
        busy: { type: Boolean },
        // A generic utility renderer: it forwards whatever loader/meta the parent
        // list produces. Pinning M here would make the prop invariant against the
        // per-entity ListMeta<T> (rapiq's SortsBuildInput<T> is a literal union),
        // so the loader stays parameter-generic.
        load: { type: Function as PropType<ListLoadFn> },
        meta: { type: Object as PropType<ListMeta<any>> },
    },
    slots: Object as SlotsType<{
        default: Record<string, any>
    }>,
    setup(props, { slots }) {
        return () => h(ASearch, {
            slots,
            icon: props.icon,
            iconPosition: props.iconPosition,
            iconClass: props.iconClass,
            busy: props.busy,
            load: props.load,
            meta: props.meta,
        });
    },
});
