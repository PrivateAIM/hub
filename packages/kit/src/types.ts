/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type ObjectLiteral = Record<string, any>;
export type ObjectLiteralKeys<T extends ObjectLiteral = ObjectLiteral> = {
    [K in keyof T as `${K & (string | number)}`]: T[K];
};

export type ObjectDiff<T extends ObjectLiteral = ObjectLiteral> = {
    [K in keyof T]: {
        next: T[K],
        previous?: T[K]
    }
};

export type ToTuple<T> = T extends [unknown, ...unknown[]] | [] ? T : [T];
