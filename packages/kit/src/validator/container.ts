/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Container } from 'validup';
import type { ITypedContainer } from './types';

/**
 * `Container` with the `mount()` key escape hatch closed — see
 * {@link ITypedContainer} for what the narrowing is and why.
 *
 * A mistyped mount key is the last compiler-blind class in the entity surface:
 * the column-naming and schema/entity-parity guards cover TypeORM columns and
 * rapiq allow-lists, neither touches validators.
 *
 * `declare` re-types the inherited member without redeclaring it — it emits no
 * runtime code and needs no cast to satisfy a base implementation signature, so
 * this is a pure type-level narrowing over validup's own behaviour.
 *
 * The proper fix belongs upstream in validup, where `(string & {})` is added to
 * the key type; this shim exists until that lands.
 *
 * The guard is pinned by `test/types/typed-container.test-d.ts`, run through
 * vitest's typecheck mode. Test files are typechecked by nothing else in CI
 * (every `tsconfig.build.json` includes `src/**` only), so a plain spec would
 * never exercise it.
 */
export class TypedContainer<
    T extends Record<string, any>,
    C = unknown,
>
    extends Container<T, C>
    implements ITypedContainer<T, C> {
    declare mount: ITypedContainer<T, C>['mount'];
}
