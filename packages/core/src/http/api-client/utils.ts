/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '../../domains';
import type { APIClient } from './module';

export function useDomainAPI(
    client: APIClient,
    name: `${DomainType}`,
) {
    switch (name) {
        case DomainType.MASTER_IMAGE:
            return client.masterImage;
        case DomainType.MASTER_IMAGE_GROUP:
            return client.masterImageGroup;
        case DomainType.PROJECT:
            return client.project;
        case DomainType.PROJECT_NODE:
            return client.projectNode;
        case DomainType.REGISTRY:
            return client.registry;
        case DomainType.REGISTRY_PROJECT:
            return client.registryProject;
        case DomainType.NODE:
            return client.node;
        case DomainType.ANALYSIS:
            return client.analysis;
        case DomainType.ANALYSIS_FILE:
            return client.analysisFile;
        case DomainType.ANALYSIS_NODE:
            return client.analysisNode;
        case DomainType.SERVICE:
            return client.service;
    }

    return undefined;
}
