/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType, SlotsType, VNodeChild } from 'vue';
import { defineComponent } from 'vue';
import { hasNormalizedSlot, normalizeSlot } from '@privateaim/client-vue';
import {
    DomainEntityNavItem, DomainEntityNavSub, type NavItems, buildNavItemLink,
} from '../core/nav';
import { NuxtLink } from '#components';

export default defineComponent({
    props: {
        path: {
            type: String,
            required: true,
        },
        items: {
            type: Array as PropType<NavItems>,
            required: true,
        },
        direction: {
            type: String as PropType<'vertical' | 'horizontal'>,
        },
        prevLink: {
            type: Boolean,
        },
    },
    slots: Object as SlotsType<{
        before: undefined,
        after: undefined
    }>,
    setup(props, { slots }) {
        const lastIndex = props.path.lastIndexOf('/');
        const basePath = props.path.substring(0, lastIndex);

        const clazz = computed(() => {
            const output = ['nav nav-pills'];
            if (props.direction === 'vertical') {
                output.push('flex-column');
            }

            return output;
        });

        return () => {
            let prevLink : VNodeChild = [];
            if (props.prevLink) {
                prevLink = h('li', { class: 'nav-item' }, [
                    h(
                        NuxtLink,
                        {
                            class: 'nav-link',
                            to: basePath,
                        },
                        {
                            default: () => [
                                h('i', { class: 'fa fa-arrow-left' }),
                            ],
                        },
                    ),
                ]);
            }

            let before : VNodeChild = [];
            if (hasNormalizedSlot('before', slots)) {
                before = normalizeSlot('before', {}, slots);
            }
            let after : VNodeChild = [];
            if (hasNormalizedSlot('after', slots)) {
                after = normalizeSlot('after', {}, slots);
            }

            return h(
                'ul',
                { class: clazz.value },
                [
                    prevLink,
                    before,
                    ...props.items.map((item) => {
                        if (item.children) {
                            return h(DomainEntityNavSub, {
                                name: `${item.name}`,
                                icon: item.icon,
                                path: buildNavItemLink(props.path, item.path),
                                children: item.children,
                            });
                        }

                        return h(DomainEntityNavItem, {
                            name: `${item.name}`,
                            icon: item.icon,
                            path: buildNavItemLink(props.path, item.path),
                        });
                    }),
                    after,
                ],
            );
        };
    },
});
