/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { KeyValidator } from '@rapiq/core';

/**
 * Build a rapiq `fields.validate` hook that keeps the listed fields to the
 * query ROOT of the schema declaring them. rapiq invokes the hook against
 * the schema that governs a key, so it also runs when the schema is reached
 * through a relation (`include=registry&fields[registry]=+x`), and
 * `scope.path` is then non-empty. A listed field is rejected there — dropped
 * under rapiq's default failure policy — and accepted at the root, where the
 * entity's own service gates it.
 *
 * Use it for `select: false` columns: a relation fieldset is selected
 * explicitly by the typeorm adapter, bypassing `select: false`, and never
 * reaches the owning service's gate.
 *
 * NOTE: schemas import this file DIRECTLY, never the `core/query` barrel —
 * the barrel reaches `module.ts`, which imports every schema.
 */
export function createRootOnlyFieldsGate(names: readonly string[]): KeyValidator {
    const rootOnly = new Set(names);

    return (name, _context, scope) => scope.path === '' || !rootOnly.has(name);
}
