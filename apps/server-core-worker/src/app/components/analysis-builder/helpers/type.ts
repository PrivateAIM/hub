/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';

/**
 * The slice of an analysis the Dockerfile is derived from.
 */
export type DockerFileAnalysis = Pick<Analysis, 'id' | 'masterImageId' | 'imageCommandArguments'>;

export type ContainerPackContext = {
    entity: Analysis,
    masterImagePath: string
};
