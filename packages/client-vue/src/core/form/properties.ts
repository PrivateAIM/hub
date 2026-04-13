/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export function initFormAttributesFromSource(
    form: Record<string, any>,
    source?: Record<string, any>,
) : void {
    if (!source) {
        return;
    }

    const keys = Object.keys(form);
    for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            form[key] = source[key] ?? '';
        }
    }
}
