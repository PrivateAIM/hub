/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { DatabaseInjectionKey } from '../../../src/app/modules/database/index.ts';
import { ComponentsInjectionKey } from '../../../src/app/modules/components/index.ts';
import { AnalysisInjectionKey } from '../../../src/app/modules/analysis/index.ts';
import { AnalysisBuilder } from '../../../src/core/services/analysis-builder/module.ts';
import { AnalysisConfigurator } from '../../../src/core/services/analysis-configurator/module.ts';
import { AnalysisDistributor } from '../../../src/core/services/analysis-distributor/module.ts';
import { AnalysisStorageManager } from '../../../src/core/services/analysis-storage-manager/module.ts';
import { createTestDatabaseApplication } from '../../app';

describe('DI module wiring', () => {
    const suite = createTestDatabaseApplication();

    beforeAll(async () => {
        await suite.setup();
    });

    afterAll(async () => {
        await suite.teardown();
    });

    // --- Database module registers all repositories ---

    it('should resolve all 13 repository injection keys', () => {
        const keys = [
            DatabaseInjectionKey.NodeRepository,
            DatabaseInjectionKey.RegistryRepository,
            DatabaseInjectionKey.MasterImageRepository,
            DatabaseInjectionKey.MasterImageGroupRepository,
            DatabaseInjectionKey.ProjectRepository,
            DatabaseInjectionKey.RegistryProjectRepository,
            DatabaseInjectionKey.AnalysisRepository,
            DatabaseInjectionKey.AnalysisBucketRepository,
            DatabaseInjectionKey.AnalysisBucketFileRepository,
            DatabaseInjectionKey.ProjectNodeRepository,
            DatabaseInjectionKey.AnalysisNodeRepository,
            DatabaseInjectionKey.AnalysisPermissionRepository,
            DatabaseInjectionKey.AnalysisNodeEventRepository,
        ];

        for (const key of keys) {
            const result = suite.container.tryResolve(key);
            expect(result.success, `Failed to resolve ${String(key.id)}`).toBe(true);
        }
    });

    // --- Components module registers TaskManager and callers ---

    it('should resolve TaskManager', () => {
        const result = suite.container.tryResolve(ComponentsInjectionKey.TaskManager);
        expect(result.success).toBe(true);
    });

    it('should resolve AnalysisMetadataComponentCaller', () => {
        const result = suite.container.tryResolve(ComponentsInjectionKey.AnalysisMetadataComponentCaller);
        expect(result.success).toBe(true);
    });

    // --- Analysis module registers all 4 pipeline services ---

    it('should resolve AnalysisBuilder', () => {
        const builder = suite.container.resolve(AnalysisInjectionKey.Builder);
        expect(builder).toBeInstanceOf(AnalysisBuilder);
    });

    it('should resolve AnalysisConfigurator', () => {
        const configurator = suite.container.resolve(AnalysisInjectionKey.Configurator);
        expect(configurator).toBeInstanceOf(AnalysisConfigurator);
    });

    it('should resolve AnalysisDistributor', () => {
        const distributor = suite.container.resolve(AnalysisInjectionKey.Distributor);
        expect(distributor).toBeInstanceOf(AnalysisDistributor);
    });

    it('should resolve AnalysisStorageManager', () => {
        const storageManager = suite.container.resolve(AnalysisInjectionKey.StorageManager);
        expect(storageManager).toBeInstanceOf(AnalysisStorageManager);
    });

    // --- Subscribers have metadataCaller injected ---

    it('should inject metadataCaller into AnalysisSubscriber', () => {
        const subscriber = suite.container.resolve(DatabaseInjectionKey.AnalysisSubscriber);
        // metadataCaller is set via setMetadataCaller in ComponentsModule
        // If it weren't set, afterUpdate would silently no-op — verify it's present
        expect(subscriber).toBeDefined();
        expect((subscriber as any).metadataCaller).toBeDefined();
    });

    it('should inject metadataCaller into AnalysisNodeSubscriber', () => {
        const subscriber = suite.container.resolve(DatabaseInjectionKey.AnalysisNodeSubscriber);
        expect((subscriber as any).metadataCaller).toBeDefined();
    });

    it('should inject metadataCaller into AnalysisBucketFileSubscriber', () => {
        const subscriber = suite.container.resolve(DatabaseInjectionKey.AnalysisBucketFileSubscriber);
        expect((subscriber as any).metadataCaller).toBeDefined();
    });

    // --- RegistryManager is wired ---

    it('should resolve RegistryManager', () => {
        const result = suite.container.tryResolve(DatabaseInjectionKey.RegistryManager);
        expect(result.success).toBe(true);
    });
});
