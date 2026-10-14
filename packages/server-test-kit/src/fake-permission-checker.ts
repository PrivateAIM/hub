/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PermissionEvaluationContext } from '@authup/access';
import type { IPermissionChecker } from '@privateaim/server-kit';
import type { PermissionCall, PermissionHandler } from './types.ts';

export class FakePermissionChecker implements IPermissionChecker {
    private handler: PermissionHandler;

    private calls: PermissionCall[] = [];

    constructor(handler?: PermissionHandler) {
        this.handler = handler ?? (() => { /* allow all */ });
    }

    async preCheck(ctx: PermissionEvaluationContext): Promise<void> {
        this.calls.push({ method: 'preCheck', ctx });
        await this.handler(ctx, 'preCheck');
    }

    async check(ctx: PermissionEvaluationContext): Promise<void> {
        this.calls.push({ method: 'check', ctx });
        await this.handler(ctx, 'check');
    }

    async preCheckOneOf(ctx: PermissionEvaluationContext): Promise<void> {
        this.calls.push({ method: 'preCheckOneOf', ctx });
        await this.handler(ctx, 'preCheckOneOf');
    }

    async checkOneOf(ctx: PermissionEvaluationContext): Promise<void> {
        this.calls.push({ method: 'checkOneOf', ctx });
        await this.handler(ctx, 'checkOneOf');
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
