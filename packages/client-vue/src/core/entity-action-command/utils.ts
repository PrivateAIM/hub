/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { vBTooltip } from 'bootstrap-vue-next';
import { isObject } from 'smob';
import { h, resolveDynamicComponent, withDirectives } from 'vue';
import type {
    Component, Slots, VNodeArrayChildren,
    VNodeChild, VNodeProps,
} from 'vue';
import { hasNormalizedSlot, normalizeSlot } from '../slot';

type Context = {
    execute() : Promise<void>;
    elementType: 'button' | 'link' | 'dropDownItem',
    withIcon: boolean,
    withText: boolean,
    isAllowed: boolean,
    isDisabled: boolean,
    commandText: string,
    commandTooltip?: string,
    iconClass: string,
    classSuffix: string,
    slots: Slots
};

export type ActionCommandSlotsType = {
    default: {
        commandText: string,
        isDisabled: boolean,
        isAllowed: boolean,
        iconClass: string[],
        execute: () => Promise<any>
    }
};

export function renderActionCommand(ctx: Context) : VNodeChild {
    if (!ctx.isAllowed) {
        return h('span', {}, ['']);
    }

    const attributes : VNodeProps & Record<string, any> = {
        onClick(event: any) {
            event.preventDefault();

            return ctx.execute();
        },
        disabled: ctx.isDisabled,
    };

    const iconClasses : string[] = [ctx.iconClass];
    if (ctx.withIcon && ctx.withText) {
        iconClasses.push('pe-1');
    }

    let tag : string | Component | undefined;

    if (ctx.elementType === 'dropDownItem') {
        const component = resolveDynamicComponent('BDropdownItem');
        if (isObject(component)) {
            tag = component as Component;
            iconClasses.push('ps-1', `text-${ctx.classSuffix}`);
        }
    }

    if (ctx.elementType === 'link') {
        tag = 'a';
        iconClasses.push(`text-${ctx.classSuffix}`);
    }

    if (!tag) {
        tag = 'button';
        attributes.type = 'button';
        attributes.class = ['btn', 'btn-xs', `btn-${ctx.classSuffix}`];
    }

    let text : VNodeArrayChildren = [ctx.commandText];

    if (!ctx.withText) {
        text = [];
    }

    if (ctx.withIcon) {
        text.unshift(h('i', {
            class: iconClasses,
        }));
    }

    if (hasNormalizedSlot('default', ctx.slots)) {
        return normalizeSlot('default', {
            commandText: ctx.commandText,
            isDisabled: ctx.isDisabled,
            isAllowed: ctx.isAllowed,
            iconClass: iconClasses,
            execute: () => ctx.execute(),
        }, ctx.slots);
    }

    const vNode = h(tag as string, attributes, text);
    if (ctx.commandTooltip) {
        return withDirectives(
            vNode,
            [
                [
                    vBTooltip,
                    ctx.commandTooltip,
                    undefined,
                    {
                        hover: true,
                        top: true,
                    },
                ],
            ],
        );
    }
    return vNode;
}
