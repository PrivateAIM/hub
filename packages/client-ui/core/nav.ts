/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    PropType,
    VNodeChild,
} from 'vue';
import { defineComponent, ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { NuxtLink } from '#components';

export type NavItem = {
    name?: string,
    icon?: string,
    path: string,
    children?: NavItem[]
};

export type NavItems = NavItem[];

export function buildNavItemLink(...items: unknown[]) {
    let output = '';
    for (let i = 0; i < items.length; i++) {
        if (typeof items[i] !== 'string') {
            continue;
        }

        if (output.substring(output.length - 1) === '/') {
            if (items[i].substring(0, 1) === '/') {
                output += items[i].substring(1);
            } else {
                output += items[i];
            }
        } else if (items[i].substring(0, 1) === '/') {
            output += items[i];
        } else {
            output += `/${items[i]}`;
        }
    }

    if (output.substring(output.length - 1) === '/') {
        return output.substring(0, output.length - 1);
    }

    return output;
}

export const DomainEntityNavItem = defineComponent({
    props: {
        name: {
            type: String,
            required: true,
        },
        path: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
        },
    },
    setup(props) {
        return () => h('li', { class: 'nav-item' }, [
            h(
                NuxtLink,
                {
                    class: ['nav-link'],
                    to: props.path,
                },
                {
                    default: () => {
                        const items : VNodeChild = [];
                        if (props.icon) {
                            items.push(h('i', { class: `${props.icon}` }));
                        }

                        if (props.icon && props.name) {
                            items.push(' ');
                        }

                        if (props.name) {
                            items.push(props.name);
                        }

                        return items;
                    },

                },
            ),
        ]);
    },
});
export const DomainEntityNavSub = defineComponent({
    props: {
        name: {
            type: String,
        },
        icon: {
            type: String,
        },
        path: {
            type: String,
            required: true,
        },
        children: {
            type: Array as PropType<NavItem[]>,
        },
    },
    setup(props) {
        const expand = ref(false);

        const linkRef = ref(null);

        onClickOutside(linkRef, () => {
            expand.value = false;
        });

        return () => {
            let icon : VNodeChild = [];
            if (props.icon) {
                icon = h('i', { class: `${props.icon} pe-1` });
            }

            return h('li', {
                class: 'nav-item dropdown',
            }, [
                h('a', {
                    ref: linkRef,
                    class: [
                        'nav-link dropdown-toggle',
                        {
                            show: expand.value,
                        },
                    ],
                    href: '#',
                    onClick($event: any) {
                        $event.preventDefault();

                        expand.value = !expand.value;
                    },
                }, [
                    icon,
                    props.name,
                ]),
                h('ul', {
                    class: ['dropdown-menu', {
                        show: expand.value,
                    }],
                }, [
                    ...(props.children || []).map((child) => h(DomainEntityNavItem, {
                        path: buildNavItemLink(props.path, child.path),
                        name: child.name,
                        icon: child.icon,
                    })),
                ]),
            ]);
        };
    },
});
