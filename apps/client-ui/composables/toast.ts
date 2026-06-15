/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from '@privateaim/kit';
import { useToast as useVuecsToast } from '@vuecs/overlays';

type LegacyVariant = 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'secondary' | 'light' | 'dark';
type VuecsColor = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'error';

function variantToColor(variant?: string): VuecsColor {
    switch (variant) {
        case 'success': return 'success';
        case 'warning': return 'warning';
        case 'danger': return 'error';
        case 'info': return 'info';
        case 'primary': return 'primary';
        default: return 'neutral';
    }
}

type ToastShowOptions = {
    body?: string;
    title?: string;
    variant?: LegacyVariant;
    pos?: string;
    [key: string]: unknown;
};

export function useToast() {
    const toast = useVuecsToast();

    function showImpl(opts: ToastShowOptions) {
        return toast.add({
            title: opts.title,
            description: opts.body,
            color: variantToColor(opts.variant),
        });
    }

    return {
        hide(el: string) {
            toast.dismiss(el);
        },
        show(
            el: string | ToastShowOptions,
            options: ToastShowOptions = {},
        ) {
            if (isObject(el)) {
                return showImpl(el as ToastShowOptions);
            }

            return showImpl({
                ...options,
                body: el,
            });
        },
    };
}
