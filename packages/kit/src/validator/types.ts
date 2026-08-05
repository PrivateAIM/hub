/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Path } from 'pathtrace';
import type {
    IContainer,
    MountOptions,
    Validator,
    ValidatorDescriptor,
} from 'validup';

/**
 * Everything `Container.mount()` accepts as the mounted value: a nested
 * container, a bare validator function, or a validator descriptor.
 */
export type MountData<C> = IContainer<any, any> | Validator<C> | ValidatorDescriptor<C>;

/**
 * `Container`'s mount surface with the key escape hatch closed.
 *
 * validup types the mount key as `Path<T> | (string & {})`, so **any** string
 * compiles. A stale or misspelled key silently stops validating that field and
 * the value is then dropped from the write — the request still returns `200`.
 *
 * These overloads are validup's own, minus that second arm. `Path<T>` still
 * admits the nested and wildcard forms (`registry.accountSecret`, `registry.*`),
 * so nothing legitimate is lost.
 */
export interface ITypedContainer<T extends Record<string, any>, C = unknown> {
    mount(container: IContainer<any, any>): void;
    mount(options: MountOptions, container: IContainer<any, any>): void;
    mount(key: Path<T>, data: MountData<C>): void;
    mount(key: Path<T>, options: MountOptions, data: MountData<C>): void;
}
