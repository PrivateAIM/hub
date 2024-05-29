/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '../../type';
import type { ComponentError } from './error';

export type Component = {
    start: () => void
};

export type ComponentErrorOptions = {
    code?: string | null,
    message?: string
    cause?: unknown
};

export type ComponentContextWithError<
    T extends ObjectLiteral = ObjectLiteral,
> = T & {
    error: ComponentError | Error
};

export type ComponentContextWithCommand<
    T extends ObjectLiteral = ObjectLiteral,
    C extends string = string,
> = Omit<T, 'command'> & {
    command: C
};
