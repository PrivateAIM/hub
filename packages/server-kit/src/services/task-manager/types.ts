/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '../../type';

export type TaskEntry<
    Data extends ObjectLiteral = ObjectLiteral,
    Key extends string = string,
> = {
    data: Data,
    type: Key,
};

export type TaskTypeMap = {
    [key: string]: ObjectLiteral
};

export type TaskEntryResolved<EntityMap extends TaskTypeMap = TaskTypeMap> = {
    [Key in keyof EntityMap]?: TaskEntry<EntityMap[Key], Key & string>;
}[keyof EntityMap];

export type TaskManagerCreateOptions<
    EntityMap extends ObjectLiteral = ObjectLiteral,
    Key extends keyof EntityMap = keyof EntityMap,
> = {
    lock?: boolean;
    key?: (type: Key & string, data: EntityMap[Key]) => string
};
