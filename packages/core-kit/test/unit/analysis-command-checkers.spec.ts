/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { ProcessStatus } from '@privateaim/kit';
import type { Analysis } from '../../src/domains/analysis/entity';
import type { MasterImage } from '../../src/domains/master-image/entity';
import type { Project } from '../../src/domains/project/entity';
import type { Registry } from '../../src/domains/registry/entity';
import { AnalysisError } from '../../src/domains/analysis/error';
import { AnalysisBuilderCommandChecker } from '../../src/domains/analysis/helpers/builder';
import { AnalysisConfiguratorCommandChecker } from '../../src/domains/analysis/helpers/configurator';
import { AnalysisDistributorCommandChecker } from '../../src/domains/analysis/helpers/distributor';

function createBaseAnalysis(overrides?: Partial<Analysis>): Analysis {
    return {
        id: 'test-id',
        name: null,
        description: null,
        nodes: 0,
        nodesApproved: 0,
        configurationLocked: false,
        configurationEntrypointValid: true,
        configurationImageValid: true,
        configurationNodeDefaultValid: true,
        configurationNodeAggregatorValid: true,
        configurationNodesValid: true,
        buildStatus: null,
        buildNodesValid: true,
        buildProgress: null,
        buildHash: null,
        buildOs: null,
        buildSize: null,
        distributionStatus: null,
        distributionProgress: null,
        executionStatus: null,
        executionProgress: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        registry: {} as Registry,
        registryId: 'registry-id',
        realmId: 'realm-id',
        userId: 'user-id',
        projectId: 'project-id',
        project: {} as Project,
        imageCommandArguments: null,
        masterImageId: null,
        masterImage: {} as MasterImage,
        ...overrides,
    };
}

// -----------------------------------------------------------------------
// AnalysisConfiguratorCommandChecker
// -----------------------------------------------------------------------

describe('AnalysisConfiguratorCommandChecker', () => {
    describe('canLock', () => {
        it('should allow locking when all preconditions are met', () => {
            const entity = createBaseAnalysis();
            expect(() => AnalysisConfiguratorCommandChecker.canLock(entity)).not.toThrow();
        });

        it('should throw when already locked', () => {
            const entity = createBaseAnalysis({ configurationLocked: true });
            expect(() => AnalysisConfiguratorCommandChecker.canLock(entity)).toThrow(AnalysisError);
        });

        it('should throw when build already initialized', () => {
            const entity = createBaseAnalysis({ buildStatus: ProcessStatus.STARTING });
            expect(() => AnalysisConfiguratorCommandChecker.canLock(entity)).toThrow(AnalysisError);
        });

        it('should throw when default node invalid', () => {
            const entity = createBaseAnalysis({ configurationNodeDefaultValid: false });
            expect(() => AnalysisConfiguratorCommandChecker.canLock(entity)).toThrow(AnalysisError);
        });

        it('should throw when aggregator node invalid', () => {
            const entity = createBaseAnalysis({ configurationNodeAggregatorValid: false });
            expect(() => AnalysisConfiguratorCommandChecker.canLock(entity)).toThrow(AnalysisError);
        });

        it('should throw when entrypoint invalid', () => {
            const entity = createBaseAnalysis({ configurationEntrypointValid: false });
            expect(() => AnalysisConfiguratorCommandChecker.canLock(entity)).toThrow(AnalysisError);
        });

        it('should throw when image invalid', () => {
            const entity = createBaseAnalysis({ configurationImageValid: false });
            expect(() => AnalysisConfiguratorCommandChecker.canLock(entity)).toThrow(AnalysisError);
        });

        it('should check conditions in order: locked → build → default node → aggregator → entrypoint → image', () => {
            const entity = createBaseAnalysis({
                configurationLocked: true,
                buildStatus: ProcessStatus.STARTING,
                configurationNodeDefaultValid: false,
                configurationNodeAggregatorValid: false,
                configurationEntrypointValid: false,
                configurationImageValid: false,
            });
            expect(() => AnalysisConfiguratorCommandChecker.canLock(entity))
                .toThrow('The analysis configuration is locked.');
        });
    });

    describe('canUnlock', () => {
        it('should allow unlocking when locked and no build started', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: null });
            expect(() => AnalysisConfiguratorCommandChecker.canUnlock(entity)).not.toThrow();
        });

        it('should throw when not locked', () => {
            const entity = createBaseAnalysis({ configurationLocked: false });
            expect(() => AnalysisConfiguratorCommandChecker.canUnlock(entity)).toThrow(AnalysisError);
        });

        it('should allow unlocking when build FAILED', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.FAILED });
            expect(() => AnalysisConfiguratorCommandChecker.canUnlock(entity)).not.toThrow();
        });

        it('should allow unlocking when build STOPPED', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.STOPPED });
            expect(() => AnalysisConfiguratorCommandChecker.canUnlock(entity)).not.toThrow();
        });

        it('should allow unlocking when build STOPPING', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.STOPPING });
            expect(() => AnalysisConfiguratorCommandChecker.canUnlock(entity)).not.toThrow();
        });

        it('should throw when build STARTING', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.STARTING });
            expect(() => AnalysisConfiguratorCommandChecker.canUnlock(entity)).toThrow(AnalysisError);
        });

        it('should throw when build STARTED', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.STARTED });
            expect(() => AnalysisConfiguratorCommandChecker.canUnlock(entity)).toThrow(AnalysisError);
        });

        it('should throw when build EXECUTING', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.EXECUTING });
            expect(() => AnalysisConfiguratorCommandChecker.canUnlock(entity)).toThrow(AnalysisError);
        });

        it('should throw when build EXECUTED', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.EXECUTED });
            expect(() => AnalysisConfiguratorCommandChecker.canUnlock(entity)).toThrow(AnalysisError);
        });
    });
});

// -----------------------------------------------------------------------
// AnalysisBuilderCommandChecker
// -----------------------------------------------------------------------

describe('AnalysisBuilderCommandChecker', () => {
    describe('canStart', () => {
        it('should allow when config locked, nodes valid, no build started', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: null });
            expect(() => AnalysisBuilderCommandChecker.canStart(entity)).not.toThrow();
        });

        it('should throw when config not locked', () => {
            const entity = createBaseAnalysis({ configurationLocked: false });
            expect(() => AnalysisBuilderCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should throw when nodes not approved', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildNodesValid: false });
            expect(() => AnalysisBuilderCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should allow retry when build FAILED', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.FAILED });
            expect(() => AnalysisBuilderCommandChecker.canStart(entity)).not.toThrow();
        });

        it('should allow retry when build STOPPED', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.STOPPED });
            expect(() => AnalysisBuilderCommandChecker.canStart(entity)).not.toThrow();
        });

        it('should throw when build STARTING', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.STARTING });
            expect(() => AnalysisBuilderCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should throw when build STARTED', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.STARTED });
            expect(() => AnalysisBuilderCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should throw when build EXECUTING', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.EXECUTING });
            expect(() => AnalysisBuilderCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should throw when build EXECUTED', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.EXECUTED });
            expect(() => AnalysisBuilderCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should throw when build STOPPING', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.STOPPING });
            expect(() => AnalysisBuilderCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });
    });

    describe('canCheck', () => {
        it('should allow when config locked and build in progress', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.STARTING });
            expect(() => AnalysisBuilderCommandChecker.canCheck(entity)).not.toThrow();
        });

        it('should throw when config not locked', () => {
            const entity = createBaseAnalysis({ configurationLocked: false, buildStatus: ProcessStatus.STARTING });
            expect(() => AnalysisBuilderCommandChecker.canCheck(entity)).toThrow(AnalysisError);
        });

        it('should throw when no build started', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: null });
            expect(() => AnalysisBuilderCommandChecker.canCheck(entity)).toThrow(AnalysisError);
        });

        it('should allow when build EXECUTED (reconciliation after data loss)', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.EXECUTED });
            expect(() => AnalysisBuilderCommandChecker.canCheck(entity)).not.toThrow();
        });

        it('should allow when build STARTED', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.STARTED });
            expect(() => AnalysisBuilderCommandChecker.canCheck(entity)).not.toThrow();
        });

        it('should allow when build EXECUTING', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.EXECUTING });
            expect(() => AnalysisBuilderCommandChecker.canCheck(entity)).not.toThrow();
        });

        it('should allow when build FAILED', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.FAILED });
            expect(() => AnalysisBuilderCommandChecker.canCheck(entity)).not.toThrow();
        });

        it('should allow when build STOPPED', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.STOPPED });
            expect(() => AnalysisBuilderCommandChecker.canCheck(entity)).not.toThrow();
        });

        it('should allow when build STOPPING', () => {
            const entity = createBaseAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.STOPPING });
            expect(() => AnalysisBuilderCommandChecker.canCheck(entity)).not.toThrow();
        });
    });
});

// -----------------------------------------------------------------------
// AnalysisDistributorCommandChecker
// -----------------------------------------------------------------------

describe('AnalysisDistributorCommandChecker', () => {
    describe('canStart', () => {
        it('should allow when build EXECUTED and no distribution started', () => {
            const entity = createBaseAnalysis({ buildStatus: ProcessStatus.EXECUTED, distributionStatus: null });
            expect(() => AnalysisDistributorCommandChecker.canStart(entity)).not.toThrow();
        });

        it('should throw when not built', () => {
            const entity = createBaseAnalysis({ buildStatus: null });
            expect(() => AnalysisDistributorCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should throw when build not EXECUTED', () => {
            const entity = createBaseAnalysis({ buildStatus: ProcessStatus.STARTED });
            expect(() => AnalysisDistributorCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should allow retry when distribution FAILED', () => {
            const entity = createBaseAnalysis({ buildStatus: ProcessStatus.EXECUTED, distributionStatus: ProcessStatus.FAILED });
            expect(() => AnalysisDistributorCommandChecker.canStart(entity)).not.toThrow();
        });

        it('should allow retry when distribution STOPPED', () => {
            const entity = createBaseAnalysis({ buildStatus: ProcessStatus.EXECUTED, distributionStatus: ProcessStatus.STOPPED });
            expect(() => AnalysisDistributorCommandChecker.canStart(entity)).not.toThrow();
        });

        it('should throw when distribution STARTING', () => {
            const entity = createBaseAnalysis({ buildStatus: ProcessStatus.EXECUTED, distributionStatus: ProcessStatus.STARTING });
            expect(() => AnalysisDistributorCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should throw when distribution STARTED', () => {
            const entity = createBaseAnalysis({ buildStatus: ProcessStatus.EXECUTED, distributionStatus: ProcessStatus.STARTED });
            expect(() => AnalysisDistributorCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should throw when distribution EXECUTING', () => {
            const entity = createBaseAnalysis({ buildStatus: ProcessStatus.EXECUTED, distributionStatus: ProcessStatus.EXECUTING });
            expect(() => AnalysisDistributorCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should throw when distribution EXECUTED', () => {
            const entity = createBaseAnalysis({ buildStatus: ProcessStatus.EXECUTED, distributionStatus: ProcessStatus.EXECUTED });
            expect(() => AnalysisDistributorCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should throw when distribution STOPPING', () => {
            const entity = createBaseAnalysis({ buildStatus: ProcessStatus.EXECUTED, distributionStatus: ProcessStatus.STOPPING });
            expect(() => AnalysisDistributorCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });
    });

    describe('canCheck', () => {
        it('should allow when build EXECUTED and distribution in progress', () => {
            const entity = createBaseAnalysis({ buildStatus: ProcessStatus.EXECUTED, distributionStatus: ProcessStatus.STARTED });
            expect(() => AnalysisDistributorCommandChecker.canCheck(entity)).not.toThrow();
        });

        it('should allow when distribution STARTING', () => {
            const entity = createBaseAnalysis({ buildStatus: ProcessStatus.EXECUTED, distributionStatus: ProcessStatus.STARTING });
            expect(() => AnalysisDistributorCommandChecker.canCheck(entity)).not.toThrow();
        });

        it('should allow when distribution FAILED', () => {
            const entity = createBaseAnalysis({ buildStatus: ProcessStatus.EXECUTED, distributionStatus: ProcessStatus.FAILED });
            expect(() => AnalysisDistributorCommandChecker.canCheck(entity)).not.toThrow();
        });

        it('should throw when distribution not initialized', () => {
            const entity = createBaseAnalysis({ buildStatus: ProcessStatus.EXECUTED, distributionStatus: null });
            expect(() => AnalysisDistributorCommandChecker.canCheck(entity)).toThrow(AnalysisError);
        });

        it('should allow when distribution EXECUTED (reconciliation after data loss)', () => {
            const entity = createBaseAnalysis({ buildStatus: ProcessStatus.EXECUTED, distributionStatus: ProcessStatus.EXECUTED });
            expect(() => AnalysisDistributorCommandChecker.canCheck(entity)).not.toThrow();
        });

        it('should throw when build not initialized', () => {
            const entity = createBaseAnalysis({ buildStatus: null });
            expect(() => AnalysisDistributorCommandChecker.canCheck(entity)).toThrow(AnalysisError);
        });

        it('should throw when build not finished', () => {
            const entity = createBaseAnalysis({ buildStatus: ProcessStatus.STARTING });
            expect(() => AnalysisDistributorCommandChecker.canCheck(entity)).toThrow(AnalysisError);
        });

        it('should throw when build FAILED', () => {
            const entity = createBaseAnalysis({ buildStatus: ProcessStatus.FAILED });
            expect(() => AnalysisDistributorCommandChecker.canCheck(entity)).toThrow(AnalysisError);
        });

        it('should throw when build STOPPED', () => {
            const entity = createBaseAnalysis({ buildStatus: ProcessStatus.STOPPED });
            expect(() => AnalysisDistributorCommandChecker.canCheck(entity)).toThrow(AnalysisError);
        });
    });
});
