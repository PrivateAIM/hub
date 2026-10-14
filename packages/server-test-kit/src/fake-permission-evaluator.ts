/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Re-exported from authup rather than re-implemented, so hub's service tests
 * drive the exact fake authup's own services are tested against: public call
 * arrays, `setBehavior` / `deny` / `denyAll`, and `compile()` defaulting to
 * `post`. The hub actor factories pass hub's `PermissionDeniedError` to
 * `denyAll`, since authup's default (`PermissionError.denied`) is not what
 * hub's `toThrow(PermissionDeniedError)` assertions expect.
 */
export { FakePermissionEvaluator } from '@authup/server-test-kit';
export type {
    EvaluatorBehavior,
    EvaluatorCall,
    EvaluatorMethodName,
} from '@authup/server-test-kit';
