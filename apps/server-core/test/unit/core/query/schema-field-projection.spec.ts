/*
 * Copyright (c) 2026.
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
import type { EntityTarget, ObjectLiteral } from 'typeorm';
import { DataSource } from 'typeorm';
import type { Schema } from '@rapiq/core';
import { AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import { DataSourceOptionsBuilder } from '../../../../src/app/modules/database/index.ts';
import { applyQuery } from '../../../../src/app/modules/database/repositories/query.ts';
import { decodeQuery } from '../../../../src/core/query/index.ts';
import { analysisNodeSchema } from '../../../../src/core/entities/analysis-node/schema.ts';
import { projectNodeSchema } from '../../../../src/core/entities/project-node/schema.ts';
import { analysisNodeEventSchema } from '../../../../src/core/entities/analysis-node-event/schema.ts';
import { masterImageGroupSchema } from '../../../../src/core/entities/master-image-group/schema.ts';
import {
    AnalysisNodeEntity,
    AnalysisNodeEventEntity,
    MasterImageGroupEntity,
    ProjectNodeEntity,
} from '../../../../src/adapters/database/entities/index.ts';

describe('core/query default field projection', () => {
    let dataSource: DataSource;

    beforeAll(async () => {
        const options = new DataSourceOptionsBuilder().buildWith({
            type: 'better-sqlite3',
            database: ':memory:',
        });
        dataSource = new DataSource(options);
        await dataSource.initialize();
        await dataSource.synchronize();
        await dataSource.query('PRAGMA foreign_keys = OFF');
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    // Seed one row, run the default-projection query, assert the seeded
    // scalar columns survive the projection (catches a mistyped/omitted
    // field name, which would drop the column or raise an SQL error).
    const expectRoundTrip = async <T extends ObjectLiteral>(
        entity: EntityTarget<T>,
        schema: Schema<any>,
        seed: Partial<T>,
    ) => {
        const repository = dataSource.getRepository(entity);
        await repository.save(repository.create(seed as T));

        const qb = repository.createQueryBuilder('e');
        applyQuery(qb, decodeQuery({}, { schema }));
        const row = await qb.getOneOrFail();

        for (const key of Object.keys(seed)) {
            expect(row[key], `${schema.name}.${key}`).toEqual((seed as ObjectLiteral)[key]);
        }
    };

    it('analysis-node projects all default fields', async () => {
        await expectRoundTrip(AnalysisNodeEntity, analysisNodeSchema, {
            analysisId: 'a-1',
            analysisRealmId: 'ar-1',
            nodeId: 'n-1',
            nodeRealmId: 'nr-1',
            approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
            executionStatus: ProcessStatus.EXECUTING,
            comment: 'note',
            executionProgress: 42,
            artifactTag: 'tag',
            artifactDigest: 'sha256:abc',
        });
    });

    it('project-node projects all default fields', async () => {
        await expectRoundTrip(ProjectNodeEntity, projectNodeSchema, {
            projectId: 'p-1',
            projectRealmId: 'pr-1',
            nodeId: 'n-2',
            nodeRealmId: 'nr-2',
            comment: 'note',
        });
    });

    it('analysis-node-event projects all default fields', async () => {
        await expectRoundTrip(AnalysisNodeEventEntity, analysisNodeEventSchema, {
            analysisId: 'a-2',
            analysisRealmId: 'ar-2',
            nodeId: 'n-3',
            nodeRealmId: 'nr-3',
            eventId: 'e-1',
        });
    });

    it('master-image-group projects all default fields', async () => {
        await expectRoundTrip(MasterImageGroupEntity, masterImageGroupSchema, {
            name: 'group',
            path: 'data/group',
            virtualPath: 'python/group',
        });
    });
});
