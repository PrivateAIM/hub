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
            analysis_id: 'a-1',
            analysis_realm_id: 'ar-1',
            node_id: 'n-1',
            node_realm_id: 'nr-1',
            approval_status: AnalysisNodeApprovalStatus.APPROVED,
            execution_status: ProcessStatus.EXECUTING,
            comment: 'note',
            execution_progress: 42,
            artifact_tag: 'tag',
            artifact_digest: 'sha256:abc',
        });
    });

    it('project-node projects all default fields', async () => {
        await expectRoundTrip(ProjectNodeEntity, projectNodeSchema, {
            project_id: 'p-1',
            project_realm_id: 'pr-1',
            node_id: 'n-2',
            node_realm_id: 'nr-2',
            comment: 'note',
        });
    });

    it('analysis-node-event projects all default fields', async () => {
        await expectRoundTrip(AnalysisNodeEventEntity, analysisNodeEventSchema, {
            analysis_id: 'a-2',
            analysis_realm_id: 'ar-2',
            node_id: 'n-3',
            node_realm_id: 'nr-3',
            event_id: 'e-1',
        });
    });

    it('master-image-group projects all default fields', async () => {
        await expectRoundTrip(MasterImageGroupEntity, masterImageGroupSchema, {
            name: 'group',
            path: 'data/group',
            virtual_path: 'python/group',
        });
    });
});
