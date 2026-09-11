/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { RegistryCommand } from '../../../../../src/app/components/index.ts';
import { ComponentsInjectionKey } from '../../../../../src/app/modules/components/index.ts';
import { DatabaseInjectionKey, registerRepositories } from '../../../../../src/app/modules/database/index.ts';
import { createTestDatabaseApplication } from '../../../../app/index.ts';
import { FakeRegistryComponentCaller } from '../registry/fake-caller.ts';

// `registerRepositories()` is exactly what `DatabaseModule.setup()` runs, and it
// runs strictly before `ComponentsModule.setup()` — orkos's topological module
// sort orders "components" after "database" because it declares
// `dependencies: ['database']`. So a `RegistryComponentCaller` is never present in
// the container yet at the moment `registerRepositories()` builds the
// `RegistryManagerAdapter` singleton. This reproduces that exact ordering by
// registering the caller AFTER `registerRepositories()` has already run, then
// exercising the manager the way an HTTP request would — long after both modules
// have finished setting up.
describe('registerRepositories — RegistryComponentCaller resolution ordering', () => {
    it('should reach a RegistryComponentCaller that is registered after registerRepositories() has already run', async () => {
        const suite = createTestDatabaseApplication();
        await suite.setup();

        try {
            registerRepositories(suite.container, suite.dataSource);

            const caller = new FakeRegistryComponentCaller();
            suite.container.register(ComponentsInjectionKey.RegistryComponentCaller, { useValue: caller });

            const manager = suite.container.resolve(DatabaseInjectionKey.RegistryManager);
            const projectId = randomUUID();

            await manager.linkProject(projectId);

            const calls = caller.getCalls();
            expect(calls).toHaveLength(1);
            expect(calls[0].command).toBe(RegistryCommand.PROJECT_LINK);
            expect(calls[0].data).toMatchObject({ id: projectId });
        } finally {
            await suite.teardown();
        }
    });
});
