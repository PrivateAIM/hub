/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PermissionCompileContext, PermissionCompileResult } from '@authup/access';
import { PermissionName } from '@privateaim/kit';
import { FakePermissionEvaluator } from '@authup/server-test-kit';
import { App, defineCoreHandler } from 'routup';
import { describe, expect, it } from 'vitest';
import { mountRateLimiterMiddleware } from '../../../src/middlewares/rate-limit.ts';
import type { RequestIdentity } from '../../../src/request/index.ts';
import { setRequestEnv, setRequestIdentity } from '../../../src/request/index.ts';

async function limitFor(
    identity?: Pick<RequestIdentity, 'type'>,
    compiled?: PermissionCompileResult | FakePermissionEvaluator,
): Promise<string | null> {
    const app = new App();
    app.use(defineCoreHandler((event) => {
        if (identity) {
            setRequestIdentity(event, {
                id: 'a',
                realmId: 'b',
                realmName: 'master',
                ...identity,
            });
        }

        if (compiled instanceof FakePermissionEvaluator) {
            setRequestEnv(event, 'permissionEvaluator', compiled);
        } else if (compiled) {
            const evaluator = new FakePermissionEvaluator();
            evaluator.setCompileResult(compiled);
            setRequestEnv(event, 'permissionEvaluator', evaluator);
        }

        return event.next();
    }));
    mountRateLimiterMiddleware(app);
    app.get('/', defineCoreHandler(() => ({})));

    const response = await app.fetch(new Request('http://hub.test/'));
    expect(response.status).toBe(200);
    return response.headers.get('ratelimit-limit');
}

/** `allow` for every name except the given ones. */
class AllowAllButEvaluator extends FakePermissionEvaluator {
    constructor(protected excluded: string[]) {
        super();
    }

    override async compile(ctx: PermissionCompileContext): Promise<PermissionCompileResult> {
        const names = Array.isArray(ctx.name) ? ctx.name : [ctx.name];
        return { verdict: names.some((name) => !this.excluded.includes(name)) ? 'allow' : 'deny' };
    }
}

describe('rate limiter', () => {
    it('skips a client whose grant reaches every realm', async () => {
        expect(await limitFor({ type: 'client' }, { verdict: 'allow' })).toBeNull();
    });

    it('limits a client whose grants are realm-bound, even in the master realm', async () => {
        expect(await limitFor({ type: 'client' }, { verdict: 'post' })).toBe(String(60 * 1000));
    });

    it('limits a client whose unbounded reach covers only some permissions', async () => {
        const evaluator = new AllowAllButEvaluator([PermissionName.ANALYSIS_UPDATE]);
        expect(await limitFor({ type: 'client' }, evaluator)).toBe(String(60 * 1000));
    });

    it('limits a client without an evaluator', async () => {
        expect(await limitFor({ type: 'client' })).toBe(String(60 * 1000));
    });

    it('limits a user with unbounded reach', async () => {
        expect(await limitFor({ type: 'user' }, { verdict: 'allow' })).toBe(String(60 * 100));
    });

    it('limits an anonymous request', async () => {
        expect(await limitFor()).toBe(String(60 * 20));
    });
});
