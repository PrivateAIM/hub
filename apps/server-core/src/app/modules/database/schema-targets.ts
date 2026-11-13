/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
import type { EntityTarget, ObjectLiteral } from 'typeorm';
import {
    AnalysisBucketEntity,
    AnalysisBucketFileEntity,
    AnalysisEntity,
    AnalysisNodeEntity,
    AnalysisNodeEventEntity,
    MasterImageEntity,
    MasterImageGroupEntity,
    NodeEntity,
    ProjectEntity,
    ProjectNodeEntity,
    RegistryEntity,
    RegistryProjectEntity,
} from '../../../adapters/database/entities/index.ts';

/**
 * The entity behind every rapiq schema of `entitySchemas`, by schema name.
 * The schema ↔ entity parity spec checks it covers every schema; the read
 * cache's invalidation maps written rows onto schema names through it.
 */
export const SCHEMA_ENTITY_TARGETS : Record<string, EntityTarget<ObjectLiteral>> = {
    [DomainType.ANALYSIS]: AnalysisEntity,
    [DomainType.ANALYSIS_BUCKET]: AnalysisBucketEntity,
    [DomainType.ANALYSIS_BUCKET_FILE]: AnalysisBucketFileEntity,
    [DomainType.ANALYSIS_NODE]: AnalysisNodeEntity,
    [DomainType.ANALYSIS_NODE_EVENT]: AnalysisNodeEventEntity,
    [DomainType.MASTER_IMAGE]: MasterImageEntity,
    [DomainType.MASTER_IMAGE_GROUP]: MasterImageGroupEntity,
    [DomainType.NODE]: NodeEntity,
    [DomainType.PROJECT]: ProjectEntity,
    [DomainType.PROJECT_NODE]: ProjectNodeEntity,
    [DomainType.REGISTRY]: RegistryEntity,
    [DomainType.REGISTRY_PROJECT]: RegistryProjectEntity,
};
