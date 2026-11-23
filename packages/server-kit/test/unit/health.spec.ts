/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Container } from 'eldin';
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import { ConfigInjectionKey } from '../../src/config';
import type { BaseServerConfig } from '../../src/config';
import {
    Health,
    HealthInjectionKey,
    createDatabaseHealthCheck,
    createHealthShutdownHook,
} from '../../src/app/health';
import type { HealthReport, IHealthCheck } from '../../src/app/health';

function failing(report: HealthReport): string[] {
    return report.checks.filter((check) => !check.ok).map((check) => check.name);
}

class FakeQueryable {
    calls = 0;

    outcome: 'ok' | 'fail' | 'hang' = 'ok';

    resolvers: (() => void)[] = [];

    async query(): Promise<unknown> {
        this.calls++;

        if (this.outcome === 'fail') {
            throw new Error('connection refused');
        }

        if (this.outcome === 'hang') {
            await new Promise<void>((resolve) => {
                this.resolvers.push(resolve);
            });
        }

        return [{ 1: 1 }];
    }
}

describe('Health', () => {
    it('answers neither probe before startup finished', async () => {
        const health = new Health();

        const liveness = await health.checkLiveness();
        const readiness = await health.checkReadiness();

        expect(liveness.healthy).toBe(false);
        expect(failing(liveness)).toEqual(['startup']);
        expect(readiness.healthy).toBe(false);
        expect(failing(readiness)).toEqual(['startup']);
    });

    it('is live and ready once started', async () => {
        const health = new Health();

        health.markStarted();

        expect((await health.checkLiveness()).healthy).toBe(true);
        expect(await health.checkReadiness()).toEqual({
            healthy: true,
            checks: [
                { name: 'startup', ok: true },
                { name: 'shutdown', ok: true },
            ],
        });
    });

    it('turns unready, not dead, when a readiness check fails or throws', async () => {
        const checks: IHealthCheck[] = [
            { name: 'database', run: () => false },
            {
                name: 'broken',
                run: () => {
                    throw new Error('boom');
                },
            },
        ];
        const health = new Health({ readiness: checks });

        health.markStarted();

        const readiness = await health.checkReadiness();

        expect(readiness.healthy).toBe(false);
        expect(failing(readiness)).toEqual(['database', 'broken']);
        expect((await health.checkLiveness()).healthy).toBe(true);
    });

    it('turns unready on the stop signal while staying live', async () => {
        const health = new Health();

        health.markStarted();
        health.markStopping();

        expect(failing(await health.checkReadiness())).toEqual(['shutdown']);
        expect((await health.checkLiveness()).healthy).toBe(true);
    });

    it('reports readiness changes only when the failing set changes', async () => {
        let ok = true;
        const changes: string[][] = [];
        const health = new Health({
            readiness: [{ name: 'database', run: () => ok }],
            onReadinessChange: (names) => {
                changes.push(names);
            },
        });

        health.markStarted();

        await health.checkReadiness();
        ok = false;
        await health.checkReadiness();
        await health.checkReadiness();
        ok = true;
        await health.checkReadiness();

        expect(changes).toEqual([['database'], []]);
    });
});

describe('createDatabaseHealthCheck', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('passes when the database answers and fails when it rejects', async () => {
        const db = new FakeQueryable();

        expect(await createDatabaseHealthCheck(db).run()).toBe(true);

        db.outcome = 'fail';
        expect(await createDatabaseHealthCheck(db).run()).toBe(false);
    });

    it('fails a query that does not answer within one second', async () => {
        const db = new FakeQueryable();

        db.outcome = 'hang';

        const check = createDatabaseHealthCheck(db);

        let result: boolean | undefined;

        Promise.resolve(check.run()).then((ok) => {
            result = ok;
        });

        await vi.advanceTimersByTimeAsync(999);
        expect(result).toBeUndefined();

        await vi.advanceTimersByTimeAsync(1);
        expect(result).toBe(false);
    });

    it('reuses a result for one second', async () => {
        const db = new FakeQueryable();
        const check = createDatabaseHealthCheck(db);

        await check.run();
        await check.run();
        expect(db.calls).toBe(1);

        await vi.advanceTimersByTimeAsync(1_000);
        await check.run();
        expect(db.calls).toBe(2);
    });

    it('issues no second query while a stalled one is outstanding', async () => {
        const db = new FakeQueryable();

        db.outcome = 'hang';

        const check = createDatabaseHealthCheck(db);

        const first = check.run();

        await vi.advanceTimersByTimeAsync(1_000);
        expect(await first).toBe(false);

        await vi.advanceTimersByTimeAsync(1_000);

        const second = check.run();

        await vi.advanceTimersByTimeAsync(1_000);
        expect(await second).toBe(false);
        expect(db.calls).toBe(1);

        db.outcome = 'ok';
        db.resolvers.forEach((resolve) => resolve());
        await vi.advanceTimersByTimeAsync(1_000);
        expect(await check.run()).toBe(true);
        expect(db.calls).toBe(2);
    });
});

describe('createHealthShutdownHook', () => {
    it('flips readiness and answers the configured delay in milliseconds', async () => {
        const container = new Container();
        const health = new Health();

        health.markStarted();

        const config: BaseServerConfig = {
            env: 'test',
            port: 0,
            realm: 'master',
            clientId: 'system',
            clientSecret: 'start123',
            shutdownDelay: 5,
        };

        container.register(HealthInjectionKey, { useValue: health });
        container.register(ConfigInjectionKey, { useValue: config });

        expect(createHealthShutdownHook(container)()).toBe(5_000);
        expect(failing(await health.checkReadiness())).toEqual(['shutdown']);
    });

    it('answers no delay without a config or health registered', () => {
        expect(createHealthShutdownHook(new Container())()).toBe(0);
    });
});
