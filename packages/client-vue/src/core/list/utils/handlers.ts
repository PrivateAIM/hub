/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from 'smob';
import type { Ref } from 'vue';

export function buildListCreatedHandler<T>(
    items: Ref<T[]>,
    cb?: (entity: T) => void | Promise<void>,
) {
    return (item: T, options?: { unshift?: boolean}) => {
        options = options || {};

        let index : number;
        if (isObject(item)) {
            index = items.value.findIndex(
                (el: T) => (el as Record<string, any>).id === (item as Record<string, any>).id,
            );
        } else {
            index = -1;
        }

        if (index === -1) {
            if (options.unshift) {
                items.value.unshift(item);
            } else {
                items.value.push(item);
            }

            if (cb) {
                cb(item);
            }
        }
    };
}

export function buildListUpdatedHandler<T>(
    items: Ref<T[]>,
    cb?: (entity: T) => void | Promise<void>,
) {
    return (item: T) => {
        if (!isObject(item)) {
            return;
        }

        const index = items.value.findIndex((el: T) => (el as Record<string, any>).id === (item as Record<string, any>).id);

        if (index !== -1) {
            const keys = Object.keys(item) as (keyof T)[];
            for (let i = 0; i < keys.length; i++) {
                items.value[index][keys[i]] = item[keys[i]];
            }

            if (cb) {
                cb(items.value[index]);
            }
        }
    };
}

export function buildListDeletedHandler<T>(
    items: Ref<T[]>,
    cb?: (entity: T) => void | Promise<void>,
) {
    return (item: T) => {
        if (!isObject(item)) {
            return;
        }

        const index = items.value.findIndex((el: T) => (el as Record<string, any>).id === (item as Record<string, any>).id);
        if (index !== -1) {
            const output = items.value[index];

            items.value.splice(index, 1);

            if (cb) {
                cb(output);
            }
        }
    };
}
