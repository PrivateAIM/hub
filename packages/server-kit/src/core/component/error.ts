/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentErrorOptions } from './type';

export class ComponentError extends Error {
    component: string;

    step?: string;

    type?: string;

    command: string;

    code?: string | number | null;

    constructor(input: ComponentErrorOptions) {
        super(input.message, { cause: input.cause });

        this.step = input.step;
        this.type = input.type;
        this.command = input.command;
    }
}
