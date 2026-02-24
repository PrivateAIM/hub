/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    afterAll, beforeAll, describe, expect, it,
} from 'vitest';
import { extendObject } from '@authup/kit';
import type { AnalysisPermission } from '@privateaim/core-kit';
import { isAuthupClientUsable, useAuthupClient } from '@privateaim/server-kit';
import {
    createTestSuite,
    expectProperties,
    removeDateProperties,
} from '../../utils';
import {
    createTestAnalysis,
    createTestProject,
} from '../../utils/domains';

describe('src/controllers/core/analysis-permission', () => {
    const suite = createTestSuite();

    beforeAll(async () => {
        await suite.up();
    });

    afterAll(async () => {
        await suite.down();
    });

    const attributes : Partial<AnalysisPermission> = {
        permission_id: '667672f6-1c6b-468f-947f-6370cf18454c',
    };

    it('should create resource', async () => {
        const client = suite.client();

        const project = await client.project.create(createTestProject());
        expect(project.id).toBeDefined();

        const analysis = await client.analysis.create(createTestAnalysis({
            project_id: project.id,
        }));
        expect(analysis.id).toBeDefined();

        attributes.analysis_id = analysis.id;

        // todo: maybe create authup policy
        if (isAuthupClientUsable()) {
            const authup = useAuthupClient();

            const permission = await authup.permission.create({ name: 'analysis_permission' });
            attributes.permission_id = permission.id;
        }

        const analysisPermission = await client.analysisPermission.create(attributes);

        delete analysisPermission.analysis;
        delete analysisPermission.permission;

        extendObject(attributes, removeDateProperties(analysisPermission));
    });

    it('should read collection', async () => {
        const client = suite.client();
        const { data } = await client.analysisPermission.getMany();
        expect(data.length).toBeGreaterThanOrEqual(1);
    });

    it('should read resource', async () => {
        const client = suite.client();

        const data = await client.analysisPermission.getOne(attributes.id);
        expectProperties(attributes, data);
    });

    it('should delete resource', async () => {
        const client = suite.client();

        await client.analysisPermission.delete(attributes.id);
    });
});
