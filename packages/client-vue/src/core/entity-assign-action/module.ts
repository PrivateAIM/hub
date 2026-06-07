/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { VNodeArrayChildren } from 'vue';
import { h, resolveComponent } from 'vue';

type Context<T> = {
    add: () => Promise<void> | void,
    drop: () => Promise<void> | void,
    item: T,
    busy?: boolean
};
export function renderEntityAssignAction<T>(
    ctx: Context<T>,
) {
    const VCIcon = resolveComponent('VCIcon');
    let children: VNodeArrayChildren = [];

    if (!ctx.busy) {
        children = [
            h('button', {
                class: ['btn btn-xs', {
                    'btn-success': !ctx.item,
                    'btn-danger': ctx.item,
                }],
                onClick($event: any) {
                    $event.preventDefault();

                    if (ctx.item) {
                        return ctx.drop.call(null);
                    }

                    return ctx.add.call(null);
                },
            }, [
                h(VCIcon, { name: ctx.item ? 'fa6-solid:minus' : 'fa6-solid:plus' }),
            ]),
        ];
    }

    return h('div', [children]);
}
