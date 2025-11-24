/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export class AnalysisError extends Error {
    static notFound() {
        return new AnalysisError('The Analysis could not be found.');
    }

    static defaultNodeRequired() {
        return new AnalysisError('At least one default node must be selected.');
    }

    static aggregatorNodeRequired() {
        return new AnalysisError('An aggregator node node must be selected.');
    }

    static nodesApprovalRequired() {
        return new AnalysisError('All assigned nodes have to approve the analysis.');
    }

    static entrypointRequired() {
        return new AnalysisError('An entrypoint must be selected.');
    }

    static imageAssignmentRequired() {
        return new AnalysisError('A master image must be assigned to the analysis.');
    }

    static configurationLocked() {
        return new AnalysisError('The analysis configuration is locked.');
    }

    static configurationNotLocked() {
        return new AnalysisError('The analysis configuration is not locked.');
    }

    static buildInitialized() {
        return new AnalysisError('The analysis build process has already been initialized.');
    }
}
