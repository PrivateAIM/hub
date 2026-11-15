/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { LoggerModule, createHealthShutdownHook } from '@privateaim/server-kit';
import type { IContainer } from 'eldin';
import { Application } from 'orkos';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { ConfigModule } from '../../../src/app/modules/config/index.ts';
import { HTTPInjectionKey, HTTPModule } from '../../../src/app/modules/http/index.ts';

/**
 * Stands in for the modules set up after the listener binds (the bus
 * consumers): it records the URL, then holds startup until released.
 */
class GateModule {
    readonly name = 'gate';

    readonly dependencies = ['http'];

    url: Promise<string>;

    release!: () => void;

    protected resolveURL!: (url: string) => void;

    constructor() {
        this.url = new Promise((resolve) => {
            this.resolveURL = resolve;
        });
    }

    async setup(container: IContainer): Promise<void> {
        const { url } = container.resolve(HTTPInjectionKey.Server);

        this.resolveURL((url ?? '').replace('0.0.0.0', '127.0.0.1').replace(/\/+$/, ''));

        await new Promise<void>((resolve) => {
            this.release = resolve;
        });
    }
}

describe('worker health endpoints', () => {
    const gate = new GateModule();
    let app: Application;
    let setup: Promise<void>;
    let baseURL: string;

    beforeAll(async () => {
        app = new Application({
            modules: [
                new ConfigModule({
                    env: 'test',
                    port: 0,
                    realm: 'master',
                    clientId: 'system',
                    clientSecret: 'start123',
                    authupURL: 'http://127.0.0.1:3010/',
                    rabbitMqConnectionString: 'amqp://127.0.0.1',
                    coreURL: 'http://127.0.0.1:3000/',
                    storageURL: 'http://127.0.0.1:3001/',
                }),
                new LoggerModule(),
                new HTTPModule(),
                gate,
            ],
        });

        setup = app.setup();
        baseURL = await gate.url;
    });

    afterAll(async () => {
        gate.release?.();
        await setup;
        await app.teardown();
    });

    it('answers neither probe before every module finished setup', async () => {
        for (const path of ['/livez', '/readyz']) {
            const response = await fetch(`${baseURL}${path}`);

            expect(response.status).toBe(503);
        }
    });

    it('answers both once started, GET and HEAD alike', async () => {
        gate.release();
        await setup;

        for (const method of ['GET', 'HEAD']) {
            for (const path of ['/livez', '/readyz']) {
                const response = await fetch(`${baseURL}${path}`, { method });

                expect(response.status).toBe(200);
                expect(response.headers.get('cache-control')).toBe('no-store');
            }
        }

        const root = await fetch(`${baseURL}/`);

        expect(typeof (await root.json()).timestamp).toBe('number');
    });

    it('turns unready on the stop signal while /livez still answers', async () => {
        // The worker reads no SHUTDOWN_DELAY: nothing routes requests to it.
        expect(createHealthShutdownHook(app.container)()).toBe(0);

        expect((await fetch(`${baseURL}/readyz`)).status).toBe(503);
        expect((await fetch(`${baseURL}/livez`)).status).toBe(200);
    });
});
