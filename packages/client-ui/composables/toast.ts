/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { OrchestratedToast } from 'bootstrap-vue-next';
import { isObject } from '@privateaim/kit';
import { useToast as _useToast } from 'bootstrap-vue-next';

export function useToast() {
    const toast = _useToast();

    const show = (
        el: string | OrchestratedToast,
        options: OrchestratedToast = {},
    ) => {
        if (typeof toast.show === 'undefined') {
            return Symbol('');
        }

        if (isObject(el)) {
            el.pos = el.pos || 'top-center';
            return toast.show({
                props: el,
            });
        }

        options.pos = options.pos || 'top-center';

        return toast.show({
            props: {
                ...(options || {}),
                body: el,
            },
        });
    };

    return {
        hide(el: symbol) {
            if (typeof toast.remove === 'undefined') {
                return;
            }

            toast.remove(el);
        },
        show,
    };
}
