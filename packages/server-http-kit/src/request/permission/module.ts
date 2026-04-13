/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ScopeName } from '@authup/core-kit';
import type {
    IPermissionEvaluator,
    PermissionEvaluationContext,
} from '@authup/access';
import {
    BuiltInPolicyType, 
    PolicyData,
} from '@authup/access';
import type { Request } from 'routup';
import { useRequestEnv } from '../env';
import { useRequestIdentity } from '../identity';

export class RequestPermissionChecker {
    protected req: Request;

    protected checker: IPermissionEvaluator;

    constructor(req: Request, checker: IPermissionEvaluator) {
        this.req = req;
        this.checker = checker;
    }

    // --------------------------------------------------------------

    async check(ctx: PermissionEvaluationContext) : Promise<void> {
        return this.checker.evaluate(this.extendCheckContext(ctx));
    }

    async preCheck(ctx: PermissionEvaluationContext) : Promise<void> {
        return this.checker.preEvaluate(this.extendCheckContext(ctx));
    }

    // --------------------------------------------------------------

    async preCheckOneOf(ctx: PermissionEvaluationContext) : Promise<void> {
        return this.checker.preEvaluateOneOf(this.extendCheckContext(ctx));
    }

    async checkOneOf(ctx: PermissionEvaluationContext) : Promise<void> {
        return this.checker.evaluateOneOf(this.extendCheckContext(ctx));
    }

    // --------------------------------------------------------------

    protected extendCheckContext(ctx: PermissionEvaluationContext) {
        const scopes = useRequestEnv(this.req, 'scopes') || [];
        if (scopes.includes(ScopeName.GLOBAL)) {
            ctx.input = ctx.input || new PolicyData();
            ctx.input.set(BuiltInPolicyType.IDENTITY, useRequestIdentity(this.req));
        }

        return ctx;
    }
}
