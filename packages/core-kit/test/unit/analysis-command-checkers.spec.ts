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
        nodes_approved: 0,
        configuration_locked: false,
        configuration_entrypoint_valid: true,
        configuration_image_valid: true,
        configuration_node_default_valid: true,
        configuration_node_aggregator_valid: true,
        configuration_nodes_valid: true,
        build_status: null,
        build_nodes_valid: true,
        build_progress: null,
        build_hash: null,
        build_os: null,
        build_size: null,
        distribution_status: null,
        distribution_progress: null,
        execution_status: null,
        execution_progress: null,
        created_at: new Date(),
        updated_at: new Date(),
        registry: {} as Registry,
        registry_id: 'registry-id',
        realm_id: 'realm-id',
        user_id: 'user-id',
        project_id: 'project-id',
        project: {} as Project,
        image_command_arguments: null,
        master_image_id: null,
        master_image: {} as MasterImage,
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
            const entity = createBaseAnalysis({ configuration_locked: true });
            expect(() => AnalysisConfiguratorCommandChecker.canLock(entity)).toThrow(AnalysisError);
        });

        it('should throw when build already initialized', () => {
            const entity = createBaseAnalysis({ build_status: ProcessStatus.STARTING });
            expect(() => AnalysisConfiguratorCommandChecker.canLock(entity)).toThrow(AnalysisError);
        });

        it('should throw when default node invalid', () => {
            const entity = createBaseAnalysis({ configuration_node_default_valid: false });
            expect(() => AnalysisConfiguratorCommandChecker.canLock(entity)).toThrow(AnalysisError);
        });

        it('should throw when aggregator node invalid', () => {
            const entity = createBaseAnalysis({ configuration_node_aggregator_valid: false });
            expect(() => AnalysisConfiguratorCommandChecker.canLock(entity)).toThrow(AnalysisError);
        });

        it('should throw when entrypoint invalid', () => {
            const entity = createBaseAnalysis({ configuration_entrypoint_valid: false });
            expect(() => AnalysisConfiguratorCommandChecker.canLock(entity)).toThrow(AnalysisError);
        });

        it('should throw when image invalid', () => {
            const entity = createBaseAnalysis({ configuration_image_valid: false });
            expect(() => AnalysisConfiguratorCommandChecker.canLock(entity)).toThrow(AnalysisError);
        });

        it('should check conditions in order: locked → build → default node → aggregator → entrypoint → image', () => {
            const entity = createBaseAnalysis({
                configuration_locked: true,
                build_status: ProcessStatus.STARTING,
                configuration_node_default_valid: false,
                configuration_node_aggregator_valid: false,
                configuration_entrypoint_valid: false,
                configuration_image_valid: false,
            });
            expect(() => AnalysisConfiguratorCommandChecker.canLock(entity))
                .toThrow('The analysis configuration is locked.');
        });
    });

    describe('canUnlock', () => {
        it('should allow unlocking when locked and no build started', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: null });
            expect(() => AnalysisConfiguratorCommandChecker.canUnlock(entity)).not.toThrow();
        });

        it('should throw when not locked', () => {
            const entity = createBaseAnalysis({ configuration_locked: false });
            expect(() => AnalysisConfiguratorCommandChecker.canUnlock(entity)).toThrow(AnalysisError);
        });

        it('should allow unlocking when build FAILED', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: ProcessStatus.FAILED });
            expect(() => AnalysisConfiguratorCommandChecker.canUnlock(entity)).not.toThrow();
        });

        it('should allow unlocking when build STOPPED', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: ProcessStatus.STOPPED });
            expect(() => AnalysisConfiguratorCommandChecker.canUnlock(entity)).not.toThrow();
        });

        it('should allow unlocking when build STOPPING', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: ProcessStatus.STOPPING });
            expect(() => AnalysisConfiguratorCommandChecker.canUnlock(entity)).not.toThrow();
        });

        it('should throw when build STARTING', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: ProcessStatus.STARTING });
            expect(() => AnalysisConfiguratorCommandChecker.canUnlock(entity)).toThrow(AnalysisError);
        });

        it('should throw when build STARTED', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: ProcessStatus.STARTED });
            expect(() => AnalysisConfiguratorCommandChecker.canUnlock(entity)).toThrow(AnalysisError);
        });

        it('should throw when build EXECUTING', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: ProcessStatus.EXECUTING });
            expect(() => AnalysisConfiguratorCommandChecker.canUnlock(entity)).toThrow(AnalysisError);
        });

        it('should throw when build EXECUTED', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: ProcessStatus.EXECUTED });
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
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: null });
            expect(() => AnalysisBuilderCommandChecker.canStart(entity)).not.toThrow();
        });

        it('should throw when config not locked', () => {
            const entity = createBaseAnalysis({ configuration_locked: false });
            expect(() => AnalysisBuilderCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should throw when nodes not approved', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_nodes_valid: false });
            expect(() => AnalysisBuilderCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should allow retry when build FAILED', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: ProcessStatus.FAILED });
            expect(() => AnalysisBuilderCommandChecker.canStart(entity)).not.toThrow();
        });

        it('should allow retry when build STOPPED', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: ProcessStatus.STOPPED });
            expect(() => AnalysisBuilderCommandChecker.canStart(entity)).not.toThrow();
        });

        it('should throw when build STARTING', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: ProcessStatus.STARTING });
            expect(() => AnalysisBuilderCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should throw when build STARTED', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: ProcessStatus.STARTED });
            expect(() => AnalysisBuilderCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should throw when build EXECUTING', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: ProcessStatus.EXECUTING });
            expect(() => AnalysisBuilderCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should throw when build EXECUTED', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: ProcessStatus.EXECUTED });
            expect(() => AnalysisBuilderCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should throw when build STOPPING', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: ProcessStatus.STOPPING });
            expect(() => AnalysisBuilderCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });
    });

    describe('canCheck', () => {
        it('should allow when config locked and build in progress', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: ProcessStatus.STARTING });
            expect(() => AnalysisBuilderCommandChecker.canCheck(entity)).not.toThrow();
        });

        it('should throw when config not locked', () => {
            const entity = createBaseAnalysis({ configuration_locked: false, build_status: ProcessStatus.STARTING });
            expect(() => AnalysisBuilderCommandChecker.canCheck(entity)).toThrow(AnalysisError);
        });

        it('should throw when no build started', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: null });
            expect(() => AnalysisBuilderCommandChecker.canCheck(entity)).toThrow(AnalysisError);
        });

        it('should throw when build already EXECUTED', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: ProcessStatus.EXECUTED });
            expect(() => AnalysisBuilderCommandChecker.canCheck(entity)).toThrow(AnalysisError);
        });

        it('should allow when build STARTED', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: ProcessStatus.STARTED });
            expect(() => AnalysisBuilderCommandChecker.canCheck(entity)).not.toThrow();
        });

        it('should allow when build EXECUTING', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: ProcessStatus.EXECUTING });
            expect(() => AnalysisBuilderCommandChecker.canCheck(entity)).not.toThrow();
        });

        it('should allow when build FAILED', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: ProcessStatus.FAILED });
            expect(() => AnalysisBuilderCommandChecker.canCheck(entity)).not.toThrow();
        });

        it('should allow when build STOPPED', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: ProcessStatus.STOPPED });
            expect(() => AnalysisBuilderCommandChecker.canCheck(entity)).not.toThrow();
        });

        it('should allow when build STOPPING', () => {
            const entity = createBaseAnalysis({ configuration_locked: true, build_status: ProcessStatus.STOPPING });
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
            const entity = createBaseAnalysis({ build_status: ProcessStatus.EXECUTED, distribution_status: null });
            expect(() => AnalysisDistributorCommandChecker.canStart(entity)).not.toThrow();
        });

        it('should throw when not built', () => {
            const entity = createBaseAnalysis({ build_status: null });
            expect(() => AnalysisDistributorCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should throw when build not EXECUTED', () => {
            const entity = createBaseAnalysis({ build_status: ProcessStatus.STARTED });
            expect(() => AnalysisDistributorCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should allow retry when distribution FAILED', () => {
            const entity = createBaseAnalysis({ build_status: ProcessStatus.EXECUTED, distribution_status: ProcessStatus.FAILED });
            expect(() => AnalysisDistributorCommandChecker.canStart(entity)).not.toThrow();
        });

        it('should allow retry when distribution STOPPED', () => {
            const entity = createBaseAnalysis({ build_status: ProcessStatus.EXECUTED, distribution_status: ProcessStatus.STOPPED });
            expect(() => AnalysisDistributorCommandChecker.canStart(entity)).not.toThrow();
        });

        it('should throw when distribution STARTING', () => {
            const entity = createBaseAnalysis({ build_status: ProcessStatus.EXECUTED, distribution_status: ProcessStatus.STARTING });
            expect(() => AnalysisDistributorCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should throw when distribution STARTED', () => {
            const entity = createBaseAnalysis({ build_status: ProcessStatus.EXECUTED, distribution_status: ProcessStatus.STARTED });
            expect(() => AnalysisDistributorCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should throw when distribution EXECUTING', () => {
            const entity = createBaseAnalysis({ build_status: ProcessStatus.EXECUTED, distribution_status: ProcessStatus.EXECUTING });
            expect(() => AnalysisDistributorCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should throw when distribution EXECUTED', () => {
            const entity = createBaseAnalysis({ build_status: ProcessStatus.EXECUTED, distribution_status: ProcessStatus.EXECUTED });
            expect(() => AnalysisDistributorCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });

        it('should throw when distribution STOPPING', () => {
            const entity = createBaseAnalysis({ build_status: ProcessStatus.EXECUTED, distribution_status: ProcessStatus.STOPPING });
            expect(() => AnalysisDistributorCommandChecker.canStart(entity)).toThrow(AnalysisError);
        });
    });

    describe('canCheck', () => {
        it('should allow when build EXECUTED', () => {
            const entity = createBaseAnalysis({ build_status: ProcessStatus.EXECUTED });
            expect(() => AnalysisDistributorCommandChecker.canCheck(entity)).not.toThrow();
        });

        it('should throw when build not initialized', () => {
            const entity = createBaseAnalysis({ build_status: null });
            expect(() => AnalysisDistributorCommandChecker.canCheck(entity)).toThrow(AnalysisError);
        });

        it('should throw when build not finished', () => {
            const entity = createBaseAnalysis({ build_status: ProcessStatus.STARTING });
            expect(() => AnalysisDistributorCommandChecker.canCheck(entity)).toThrow(AnalysisError);
        });

        it('should throw when build FAILED', () => {
            const entity = createBaseAnalysis({ build_status: ProcessStatus.FAILED });
            expect(() => AnalysisDistributorCommandChecker.canCheck(entity)).toThrow(AnalysisError);
        });

        it('should throw when build STOPPED', () => {
            const entity = createBaseAnalysis({ build_status: ProcessStatus.STOPPED });
            expect(() => AnalysisDistributorCommandChecker.canCheck(entity)).toThrow(AnalysisError);
        });
    });
});
