/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentErrorOptions } from './type';

export class ComponentError extends Error {
    public readonly code?: string | null;

    constructor(input: ComponentErrorOptions) {
        super(input.message, { cause: input.cause });

        this.code = input.code;
    }
}
