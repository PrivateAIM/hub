/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Registry } from '@privateaim/core-kit';
import { drain } from '@hubwire/test';
import { ProcessStatus } from '@privateaim/kit';
import {
    LoggerInjectionKey,
    MessageBusInjectionKey,
    RemoteMessageBusInjectionKey,
} from '@privateaim/server-kit';
import { FakeEntityRepository } from '@privateaim/server-test-kit';
import { Container } from 'eldin';
import type { Message } from 'hubwire';
import { MemoryMessageBusDriver, MessageBus } from 'hubwire';
import { describe, expect, it } from 'vitest';
import { RegistryCommand } from '../../../../../src/core/domains/index.ts';
import { AnalysisBuilder } from '../../../../../src/core/services/analysis-builder/module.ts';
import { AnalysisDistributor } from '../../../../../src/core/services/analysis-distributor/module.ts';
import { ANALYSIS_PROCESS_STALE_THRESHOLD_MS } from '../../../../../src/core/services/helpers.ts';
import { AnalysisInjectionKey } from '../../../../../src/app/modules/analysis/constants.ts';
import { ComponentsInjectionKey } from '../../../../../src/app/modules/components/constants.ts';
import { ComponentsModule } from '../../../../../src/app/modules/components/module.ts';
import { ConfigInjectionKey } from '../../../../../src/app/modules/config/constants.ts';
import { DatabaseInjectionKey } from '../../../../../src/app/modules/database/constants.ts';
import { createFullAnalysis } from '../../../../utils/domains/index.ts';
import { FakeLogger } from '../../aggregators/fake-logger.ts';
import { FakeAnalysisRepository } from '../../../core/entities/analysis/fake-repository.ts';
import { FakeAnalysisMetadataRecalculator } from '../../../core/entities/analysis/fake-metadata-recalculator.ts';
import { FakeAnalysisNodeRepository } from '../../../core/entities/analysis-node/fake-repository.ts';
import { FakeAnalysisNodeMetadataRecalculator } from '../../../core/entities/analysis-node/fake-metadata-recalculator.ts';
import { FakeAnalysisFileMetadataRecalculator } from '../../../core/entities/analysis-bucket-file/fake-metadata-recalculator.ts';
import { FakeAnalysisBuilderDispatcher } from '../../../core/services/helpers/fake-builder-dispatcher.ts';
import { FakeAnalysisDistributorDispatcher } from '../../../core/services/helpers/fake-distributor-dispatcher.ts';

class RecordingAnalysisRepository extends FakeAnalysisRepository {
    readonly updatedBeforeQueries: Date[] = [];

    async findManyInProgressUpdatedBefore(updatedBefore: Date) {
        this.updatedBeforeQueries.push(updatedBefore);

        return super.findManyInProgressUpdatedBefore(updatedBefore);
    }
}

describe('ComponentsModule', () => {
    it.each([false, true])('should reconcile only with a remote bus and keep the registry consumer working (remote: %s)', async (remote) => {
        const repository = new RecordingAnalysisRepository();
        const builderDispatcher = new FakeAnalysisBuilderDispatcher();
        const distributorDispatcher = new FakeAnalysisDistributorDispatcher();
        const dependencies = {
            repository,
            analysisNodeRepository: new FakeAnalysisNodeRepository(),
            analysisRecalculator: new FakeAnalysisMetadataRecalculator(repository),
            nodeRecalculator: new FakeAnalysisNodeMetadataRecalculator(repository),
            fileRecalculator: new FakeAnalysisFileMetadataRecalculator(repository),
        };
        const startedAt = Date.now();
        const stale = new Date(startedAt - ANALYSIS_PROCESS_STALE_THRESHOLD_MS - 60_000);

        repository.seed([
            createFullAnalysis({
                id: 'stuck-build',
                configurationLocked: true,
                buildStatus: ProcessStatus.STARTING,
                updatedAt: stale,
            }),
            createFullAnalysis({
                id: 'stuck-distribution',
                buildStatus: ProcessStatus.EXECUTED,
                distributionStatus: ProcessStatus.STARTED,
                updatedAt: stale,
            }),
            createFullAnalysis({ id: 'fresh-build', buildStatus: ProcessStatus.STARTED }),
            createFullAnalysis({
                id: 'finished-build',
                buildStatus: ProcessStatus.EXECUTED,
                updatedAt: stale,
            }),
        ]);

        const consumed: Message[] = [];
        const errors: unknown[] = [];
        const messageBus = new MessageBus({
            driver: new MemoryMessageBusDriver(),
            hooks: {
                onConsume: (message) => {
                    consumed.push(message);
                },
                onError: (error) => {
                    errors.push(error);
                },
            },
        });
        const logger = new FakeLogger();
        const container = new Container();

        container.register(ConfigInjectionKey, {
            useValue: {
                env: 'test',
                port: 0,
                realm: 'test',
                clientId: 'test',
                clientSecret: 'test',
                publicURL: 'http://hub.example/',
                masterImagesOwner: 'test',
                masterImagesRepository: 'test',
                masterImagesBranch: 'test',
                skipProjectApproval: false,
                skipAnalysisApproval: false,
            },
        });
        container.register(LoggerInjectionKey, { useValue: logger });
        container.register(MessageBusInjectionKey, { useValue: messageBus });
        container.register(DatabaseInjectionKey.AnalysisRepository, { useValue: repository });
        container.register(AnalysisInjectionKey.Builder, { useValue: new AnalysisBuilder({ ...dependencies, dispatcher: builderDispatcher }) });
        container.register(AnalysisInjectionKey.Distributor, {
            useValue: new AnalysisDistributor({
                ...dependencies,
                registryRepository: new FakeEntityRepository<Registry>(),
                dispatcher: distributorDispatcher,
            }),
        });

        if (remote) {
            container.register(RemoteMessageBusInjectionKey, { useValue: messageBus });
        }

        const module = new ComponentsModule();

        try {
            await module.setup(container);

            const registry = container.resolve(ComponentsInjectionKey.RegistryComponentDispatcher);

            // This handler validates the hook without needing Harbor or a database.
            await registry.dispatch(RegistryCommand.HOOK_PROCESS, {});
            await drain();

            expect(consumed).toHaveLength(1);
            expect(consumed[0].type).toBe(RegistryCommand.HOOK_PROCESS);
            expect(errors).toEqual([]);
        } finally {
            // Teardown stops scheduling and awaits the real startup pass via settled().
            await module.teardown();
            await messageBus.close();
        }

        expect(repository.updatedBeforeQueries).toHaveLength(remote ? 1 : 0);

        if (remote) {
            expect(repository.updatedBeforeQueries[0].getTime()).toBeGreaterThanOrEqual(startedAt - ANALYSIS_PROCESS_STALE_THRESHOLD_MS);
            expect(repository.updatedBeforeQueries[0].getTime()).toBeLessThanOrEqual(Date.now() - ANALYSIS_PROCESS_STALE_THRESHOLD_MS);
        }

        expect(builderDispatcher.getCalls()).toEqual(remote ? [{ method: 'dispatchCheck', data: { id: 'stuck-build' } }] : []);
        expect(distributorDispatcher.getCalls()).toEqual(remote ? [{ method: 'dispatchCheck', data: { id: 'stuck-distribution' } }] : []);
        expect(logger.entries.filter((entry) => entry.level === 'error')).toEqual([]);
    });
});
