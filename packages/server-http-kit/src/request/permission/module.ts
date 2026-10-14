/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    IPermissionEvaluator,
    PermissionEvaluationContext,
} from '@authup/access';

/**
 * Forwards to the request's evaluator. It used to attach the request identity
 * as `IDENTITY` policy data for `global`-scoped tokens, but the catalog
 * evaluator (`createAuthorizationEvaluator`) owns that key: it overwrites it
 * with the identity it was built for, or deletes it when built without one.
 * Whether an identity is placed at all is decided once, when the evaluator is
 * built (`resolveAuthupPolicySubject`).
 */
export class RequestPermissionChecker {
    protected checker: IPermissionEvaluator;

    constructor(checker: IPermissionEvaluator) {
        this.checker = checker;
    }

    // --------------------------------------------------------------

    async check(ctx: PermissionEvaluationContext) : Promise<void> {
        return this.checker.evaluate(ctx);
    }

    async preCheck(ctx: PermissionEvaluationContext) : Promise<void> {
        return this.checker.preEvaluate(ctx);
    }

    // --------------------------------------------------------------

    async preCheckOneOf(ctx: PermissionEvaluationContext) : Promise<void> {
        return this.checker.preEvaluateOneOf(ctx);
    }

    async checkOneOf(ctx: PermissionEvaluationContext) : Promise<void> {
        return this.checker.evaluateOneOf(ctx);
    }
}
