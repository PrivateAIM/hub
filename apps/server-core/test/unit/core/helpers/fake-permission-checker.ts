/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PermissionEvaluationContext } from '@authup/access';
import type { IPermissionChecker } from '@privateaim/server-kit';

type PermissionCall = {
    method: string;
    ctx: PermissionEvaluationContext;
};

export class FakePermissionChecker implements IPermissionChecker {
    private handler: (ctx: PermissionEvaluationContext) => void;

    private calls: PermissionCall[] = [];

    constructor(handler?: (ctx: PermissionEvaluationContext) => void) {
        this.handler = handler ?? (() => { /* allow all */ });
    }

    async preCheck(ctx: PermissionEvaluationContext): Promise<void> {
        this.calls.push({ method: 'preCheck', ctx });
        this.handler(ctx);
    }

    async check(ctx: PermissionEvaluationContext): Promise<void> {
        this.calls.push({ method: 'check', ctx });
        this.handler(ctx);
    }

    async preCheckOneOf(ctx: PermissionEvaluationContext): Promise<void> {
        this.calls.push({ method: 'preCheckOneOf', ctx });
        this.handler(ctx);
    }

    async checkOneOf(ctx: PermissionEvaluationContext): Promise<void> {
        this.calls.push({ method: 'checkOneOf', ctx });
        this.handler(ctx);
    }

    // --- Test helpers ---

    getCalls(): PermissionCall[] {
        return [...this.calls];
    }

    getCallCount(): number {
        return this.calls.length;
    }

    getCallsFor(method: string): PermissionCall[] {
        return this.calls.filter((c) => c.method === method);
    }

    wasMethodCalled(method: string): boolean {
        return this.calls.some((c) => c.method === method);
    }
}
