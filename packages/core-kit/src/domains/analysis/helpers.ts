/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AnalysisAPICommand, AnalysisBuildStatus } from './constants';
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
    command: `${AnalysisAPICommand}`,
) : CanResult {
    const output : CanResult = {
        success: false,
        message: `The analysis command ${command} cannot be executed.`,
    };

    switch (command) {
        case AnalysisAPICommand.BUILD_START: {
            if (!entity.configuration_locked) {
                output.success = false;
                output.message = 'The analysis configuration must be locked before starting the build.';
                return output;
            }

            if (!entity.build_status) {
                output.success = true;
                return output;
            }

            if (
                entity.build_status === AnalysisBuildStatus.FAILED ||
                entity.build_status === AnalysisBuildStatus.STOPPED
            ) {
                output.success = true;
                return output;
            }

            output.message = `The current analysis build status "${entity.build_status}" does not allow a build start.`;
            return output;
        }
        case AnalysisAPICommand.BUILD_STOP: {
            if (!entity.configuration_locked) {
                output.message = 'The analysis configuration must be locked before stopping the build.';
                return output;
            }

            if (!entity.build_status) {
                output.message = 'The analysis build process has not been initialized.';
                return output;
            }

            if (entity.build_status === AnalysisBuildStatus.STOPPING ||
                entity.build_status === AnalysisBuildStatus.STARTED ||
                entity.build_status === AnalysisBuildStatus.STARTING
            ) {
                output.success = true;
                return output;
            }

            output.message = `The current analysis build status "${entity.build_status}" does not allow a build stop.`;
            return output;
        }
        case AnalysisAPICommand.BUILD_STATUS: {
            if (!entity.configuration_locked) {
                output.message = 'The analysis configuration must be locked before checking the build status.';
                return output;
            }

            if (!entity.build_status) {
                output.message = 'The analysis build process has not been initialized.';
                return output;
            }

            if (entity.build_status === AnalysisBuildStatus.FINISHED) {
                output.message = 'The analysis build process has already been successfully completed.';
                return output;
            }

            output.success = true;
            return output;
        }
        case AnalysisAPICommand.CONFIGURATION_LOCK: {
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

            if (!entity.configuration_node_default) {
                const error = AnalysisError.defaultNodeRequired();
                output.message = error.message;
                return output;
            }

            if (!entity.configuration_node_aggregator) {
                const error = AnalysisError.aggregatorNodeRequired();
                output.message = error.message;
                return output;
            }

            if (!entity.configuration_image) {
                const error = AnalysisError.imageAssignmentRequired();
                output.message = error.message;
                return output;
            }

            output.success = true;
            return output;
        }
        case AnalysisAPICommand.CONFIGURATION_UNLOCK: {
            if (!entity.configuration_locked) {
                output.message = 'The analysis configuration is already unlocked.';
                return output;
            }

            if (!entity.build_status) {
                output.success = true;
                return output;
            }

            if (
                entity.build_status === AnalysisBuildStatus.FAILED ||
                entity.build_status === AnalysisBuildStatus.STOPPED ||
                entity.build_status === AnalysisBuildStatus.STOPPING
            ) {
                output.success = true;
                return output;
            }

            output.message = `The current analysis build status "${entity.build_status}" does not allow unlocking the configuration.`;
            return output;
        }
    }

    return output;
}
