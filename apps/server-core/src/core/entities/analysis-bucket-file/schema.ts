/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import type { AnalysisBucketFile } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';

const schemaMapping = {
    analysis: DomainType.ANALYSIS,
    analysisBucket: DomainType.ANALYSIS_BUCKET,
};

export const analysisBucketFileSchema = defineSchema<AnalysisBucketFile>({
    name: DomainType.ANALYSIS_BUCKET_FILE,
    strict: true,
    // `analysisId` anchors through the UNIQUE(analysisId, path) it leads;
    // `path` still needs its own single for the non-leading position.
    indexes: [
        ['analysisId', 'path'],
        ['path'],
        ['root'],
        ['analysisBucketId'],
        ['createdAt'],
        ['updatedAt'],
    ],
    fields: {
        default: ['id', 'path', 'root', 'bucketId', 'bucketFileId', 'clientId', 'robotId', 'userId', 'realmId', 'analysisId', 'analysisBucketId', 'createdAt', 'updatedAt'],
        allowed: ['id', 'path', 'root', 'bucketId', 'bucketFileId', 'clientId', 'robotId', 'userId', 'realmId', 'analysisId', 'analysisBucketId', 'createdAt', 'updatedAt'],
    },
    filters: { allowed: ['path', 'root', 'analysisBucketId', 'analysisId'], indexed: true },
    relations: { allowed: ['analysis', 'analysisBucket'] },
    sorts: { allowed: ['path', 'createdAt', 'updatedAt'], indexed: true },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
