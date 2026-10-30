/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MaybeRef } from 'vue';


export type FormSubmitOptionsInput = {
    submit: () => void | Promise<void>;
    busy?: MaybeRef<boolean>;
    invalid?: boolean;
    isEditing?: boolean;
    createText?: string;
    updateText?: string;
    /** Iconify name rendered before the label in create mode. */
    createIcon?: string;
    /** Iconify name rendered before the label in update mode. */
    updateIcon?: string;
    type?: string;
    /** Set to `false` to suppress the leading icon entirely. Defaults to `true`. */
    icon?: boolean;
};
