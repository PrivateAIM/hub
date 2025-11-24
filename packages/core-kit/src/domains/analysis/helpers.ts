/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProcessStatus } from '@privateaim/kit';
import { AnalysisCommand } from './constants';
import type { Analysis } from './entity';
import { AnalysisError } from './error';

type CanResult = {
    success: boolean,
    message: string,
};

/**
 * Check if an analysis can be build based on analysis attributes (build_status, configuration_locked, ...)
 *
 * @param entity
 * @param command
 */
export function isAnalysisAPICommandExecutable(
    entity: Analysis,
    command: `${AnalysisCommand}`,
) : CanResult {
    const output : CanResult = {
        success: false,
        message: `The analysis command ${command} cannot be executed.`,
    };

    switch (command) {
        case AnalysisCommand.BUILD_START: {
            if (!entity.configuration_locked) {
                output.success = false;
                output.message = 'The analysis configuration must be locked before starting the build.';
                return output;
            }

            if (!entity.build_nodes_valid) {
                const error = AnalysisError.nodesApprovalRequired();
                output.message = error.message;

                return output;
            }

            if (!entity.build_status) {
                output.success = true;
                return output;
            }

            if (
                entity.build_status === ProcessStatus.FAILED ||
                entity.build_status === ProcessStatus.STOPPED
            ) {
                output.success = true;
                return output;
            }

            output.message = `The current analysis build status "${entity.build_status}" does not allow a build start.`;
            return output;
        }
        case AnalysisCommand.BUILD_CHECK: {
            if (!entity.configuration_locked) {
                output.message = 'The analysis configuration must be locked before checking the build status.';
                return output;
            }

            if (!entity.build_status) {
                output.message = 'The analysis build process has not been initialized.';
                return output;
            }

            if (entity.build_status === ProcessStatus.FINISHED) {
                output.message = 'The analysis build process has already been successfully completed.';
                return output;
            }

            output.success = true;
            return output;
        }
        case AnalysisCommand.CONFIGURATION_LOCK: {
            if (entity.configuration_locked) {
                const error = AnalysisError.configurationLocked();
                output.message = error.message;
                return output;
            }

            if (entity.build_status) {
                const error = AnalysisError.buildInitialized();
                output.message = error.message;
                return output;
            }

            if (!entity.configuration_node_default_valid) {
                const error = AnalysisError.defaultNodeRequired();
                output.message = error.message;
                return output;
            }

            if (!entity.configuration_node_aggregator_valid) {
                const error = AnalysisError.aggregatorNodeRequired();
                output.message = error.message;
                return output;
            }

            if (!entity.configuration_entrypoint_valid) {
                const error = AnalysisError.entrypointRequired();
                output.message = error.message;
                return output;
            }

            if (!entity.configuration_image_valid) {
                const error = AnalysisError.imageAssignmentRequired();
                output.message = error.message;
                return output;
            }

            output.success = true;
            return output;
        }
        case AnalysisCommand.CONFIGURATION_UNLOCK: {
            if (!entity.configuration_locked) {
                output.message = 'The analysis configuration is already unlocked.';
                return output;
            }

            if (!entity.distribution_status) {
                output.success = true;
                return output;
            }

            if (
                entity.build_status === ProcessStatus.FAILED ||
                entity.build_status === ProcessStatus.STOPPED ||
                entity.build_status === ProcessStatus.STOPPING
            ) {
                output.success = true;
                return output;
            }

            output.message = `The current analysis build status "${entity.build_status}" does not allow unlocking the configuration.`;
            return output;
        }
        case AnalysisCommand.DISTRIBUTION_START: {
            if (!entity.build_status || entity.build_status !== ProcessStatus.FINISHED) {
                output.message = 'The analysis is not built yet.';
                return output;
            }

            output.success = true;

            return output;
        }
    }

    return output;
}
