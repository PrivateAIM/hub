/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { LoggerModule, MessageBusModule } from '@privateaim/server-kit';
import { MemoryMessageBusDriver } from 'hubwire';
import type { IModule } from 'orkos';
import { Application } from 'orkos';
import { describe, expect, it } from 'vitest';
import { AnalysisModule } from '../../../../../src/app/modules/analysis/index.ts';
import { ComponentsModule } from '../../../../../src/app/modules/components/index.ts';
import { ConfigModule } from '../../../../../src/app/modules/config/index.ts';
import { HTTPInjectionKey, HTTPModule } from '../../../../../src/app/modules/http/index.ts';
import { createTestDatabaseModule } from '../../../../app/database.ts';

// `HTTPModule` `tryResolve`s the registry dispatcher that the "components"
// module registers; without it, registry commands fail and the Harbor webhook
// controller is not mounted. So "components" must be set up first, whatever
// order the modules were added in.
describe('src/app/modules/http/module', () => {
    it('should set up the components module before the http module', async () => {
        let httpSetUp: boolean | undefined;
        const components: IModule = {
            name: 'components',
            dependencies: new ComponentsModule().dependencies,
            async setup(container) {
                httpSetUp = container.tryResolve(HTTPInjectionKey.App).success;
            },
        };

        const app = new Application({
            modules: [
                new ConfigModule(),
                new LoggerModule(),
                new MessageBusModule({ driverFactory: () => new MemoryMessageBusDriver() }),
                createTestDatabaseModule(),
                new AnalysisModule(),
                new HTTPModule({ skipServer: true }),
                components,
            ],
        });

        await app.setup();
        try {
            expect(httpSetUp).toBe(false);
        } finally {
            await app.teardown();
        }
    });
});
