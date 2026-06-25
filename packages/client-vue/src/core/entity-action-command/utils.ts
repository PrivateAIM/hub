/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from 'smob';
import { h, resolveDynamicComponent } from 'vue';
import type {
    Component,
    Slots,
    VNodeArrayChildren,
    VNodeChild,
    VNodeProps,
} from 'vue';
import { VCButton } from '@vuecs/button';
import { VCIcon } from '@vuecs/icon';
import { resolveButtonColor, resolveTextColorClass } from '../color';
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
        iconName: string,
        iconClass: string[],
        execute: () => Promise<any>
    }
};

export function renderActionCommand(ctx: Context) : VNodeChild {
    if (!ctx.isAllowed) {
        return h('span', {}, ['']);
    }

    const onClick = (event: any) => {
        event.preventDefault();

        return ctx.execute();
    };

    const iconClasses : string[] = [];
    if (ctx.withIcon && ctx.withText) {
        iconClasses.push('me-1');
    }

    // Link / dropdown-item element resolution. The button case renders a
    // <VCButton> further down (legacy `.btn .btn-xs .btn-${suffix}`); links
    // and dropdown items keep their bare tag and carry the status color on
    // the icon via the resolved Tailwind class.
    let tag : string | Component | undefined;

    if (ctx.elementType === 'dropDownItem') {
        const component = resolveDynamicComponent('VCDropdownMenuItem');
        if (isObject(component)) {
            tag = component as Component;
            iconClasses.push('ps-1', resolveTextColorClass(ctx.classSuffix));
        }
    }

    if (ctx.elementType === 'link') {
        tag = 'a';
        iconClasses.push(resolveTextColorClass(ctx.classSuffix));
    }

    let text : VNodeArrayChildren = [ctx.commandText];

    if (!ctx.withText) {
        text = [];
    }

    if (ctx.withIcon) {
        text.unshift(h(VCIcon, {
            name: ctx.iconClass,
            class: iconClasses,
        }));
    }

    if (hasNormalizedSlot('default', ctx.slots)) {
        return normalizeSlot('default', {
            commandText: ctx.commandText,
            isDisabled: ctx.isDisabled,
            isAllowed: ctx.isAllowed,
            iconName: ctx.iconClass,
            iconClass: iconClasses,
            execute: () => ctx.execute(),
        }, ctx.slots);
    }

    if (!tag) {
        return h(
            VCButton,
            {
                size: 'xs',
                color: resolveButtonColor(ctx.classSuffix),
                disabled: ctx.isDisabled,
                title: ctx.commandTooltip,
                onClick,
            },
            () => text,
        );
    }

    const attributes : VNodeProps & Record<string, any> = {
        onClick,
        disabled: ctx.isDisabled,
    };

    if (ctx.commandTooltip) {
        attributes.title = ctx.commandTooltip;
    }

    return h(tag as string, attributes, text);
}
