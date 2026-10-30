/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/* eslint-disable max-classes-per-file */
import type * as Hubwire from 'hubwire';
import type { IContainer } from 'eldin';
import {
    LoggerInjectionKey,
    MessageBusInjectionKey,
    RemoteMessageBusInjectionKey,
} from '@privateaim/server-kit';
import { RemoteWorker } from 'hubwire';
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import { AnalysisReconciler } from '../../../../../src/core/services/analysis-reconciler/index.ts';
import { createAnalysisReconcilerComponent } from '../../../../../src/app/components/analysis-reconciler/module.ts';
import { RegistryTaskMessageBusRouting } from '../../../../../src/app/components/registry/constants.ts';
import { AnalysisInjectionKey } from '../../../../../src/app/modules/analysis/constants.ts';
import { ComponentsModule } from '../../../../../src/app/modules/components/module.ts';
import { ConfigInjectionKey } from '../../../../../src/app/modules/config/constants.ts';
import { DatabaseInjectionKey } from '../../../../../src/app/modules/database/constants.ts';

vi.mock('hubwire', async (importOriginal) => ({
    ...await importOriginal<typeof Hubwire>(),
    RemoteWorker: vi.fn(class {
        start = vi.fn().mockResolvedValue(undefined);
    }),
}));

vi.mock('../../../../../src/app/components/registry/module.ts', () => ({ RegistryComponent: vi.fn(class {}) }));

vi.mock('../../../../../src/app/components/registry/dispatcher/module.ts', () => ({ RegistryComponentDispatcher: vi.fn(class {}) }));

vi.mock('../../../../../src/core/services/analysis-reconciler/index.ts', () => ({ AnalysisReconciler: vi.fn(class {}) }));

vi.mock('../../../../../src/app/components/analysis-reconciler/module.ts', () => ({ createAnalysisReconcilerComponent: vi.fn(() => ({ start: vi.fn().mockResolvedValue(undefined) })) }));

describe('ComponentsModule remote reconciler gate', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it.each([false, true])('starts the reconciler only with a remote bus (remote: %s)', async (remote) => {
        const messageBus = {};
        const values = new Map<unknown, unknown>([
            [ConfigInjectionKey, { publicURL: 'http://localhost' }],
            [LoggerInjectionKey, {}],
            [MessageBusInjectionKey, messageBus],
        ]);

        if (remote) {
            values.set(RemoteMessageBusInjectionKey, messageBus);
            values.set(DatabaseInjectionKey.AnalysisRepository, {});
            values.set(AnalysisInjectionKey.Builder, {});
            values.set(AnalysisInjectionKey.Distributor, {});
        }

        const container = {
            resolve(key: unknown) {
                if (!values.has(key)) {
                    throw new Error('Unexpected dependency');
                }

                return values.get(key);
            },
            tryResolve: (key: unknown) => ({ success: values.has(key), data: values.get(key) }),
            register: vi.fn(),
        };

        await new ComponentsModule().setup(container as unknown as IContainer);

        expect(RemoteWorker).toHaveBeenCalledExactlyOnceWith(expect.anything(), expect.objectContaining({
            consume: RegistryTaskMessageBusRouting,
            messageBus,
        }));
        expect(vi.mocked(RemoteWorker).mock.results[0].value.start).toHaveBeenCalledOnce();
        expect(AnalysisReconciler).toHaveBeenCalledTimes(remote ? 1 : 0);
        expect(createAnalysisReconcilerComponent).toHaveBeenCalledTimes(remote ? 1 : 0);

        if (remote) {
            expect(vi.mocked(createAnalysisReconcilerComponent).mock.results[0].value.start).toHaveBeenCalledOnce();
        }
    });
});
