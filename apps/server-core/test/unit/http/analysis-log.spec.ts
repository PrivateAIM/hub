/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import { createRestrictedAccessToken } from '@privateaim/server-test-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { createTestApplication } from '../../app';
import { createTestProject } from '../../utils/domains';

// `AnalysisLogController` proxies the telemetry log store, so it could not be
// exercised at all without either a live telemetry service or this opt-in
// transport-level fake. The fake also lets the spec assert the LABEL mapping
// the controller performs — analysisId -> refType/refId — which is the
// controller's entire job and was previously unverified.

describe('src/controllers/core/analysis-log', () => {
    const telemetryRequests: { url: string }[] = [];

    const suite = createTestApplication({
        telemetryHandlers: {
            'GET /logs': (req) => {
                telemetryRequests.push({ url: req.url });
                return {
                    data: [{ message: 'hello from the analysis', level: 'info' }],
                    meta: { total: 1 },
                };
            },
            'DELETE /logs': (req) => {
                telemetryRequests.push({ url: req.url });
                return undefined;
            },
        },
    });

    // The proxy authorizes against the referenced analysis, so it must exist.
    let ANALYSIS_ID: string;
    let PROJECT_ID: string;

    beforeAll(async () => {
        await suite.setup();

        const { client } = suite;
        const { data: project } = await client.project.create(createTestProject());
        PROJECT_ID = project.id;
        const { data: analysis } = await client.analysis.create({ projectId: project.id });
        ANALYSIS_ID = analysis.id;
    });

    // Reset per test: asserting on `telemetryRequests[length - 1]` would
    // otherwise couple each case to the execution order of the ones before it.
    beforeEach(() => {
        telemetryRequests.length = 0;
    });

    afterAll(async () => {
        try {
            if (ANALYSIS_ID) {
                await suite.client.analysis.delete(ANALYSIS_ID);
            }
            if (PROJECT_ID) {
                await suite.client.project.delete(PROJECT_ID);
            }
        } finally {
            await suite.teardown();
        }
    });

    it('should proxy the analysis log collection from the telemetry store', async () => {
        const { client } = suite;

        const { data, meta } = await client.analysisLog.getMany({ filters: { analysisId: ANALYSIS_ID } });

        expect(data).toHaveLength(1);
        expect(data[0].message).toBe('hello from the analysis');
        expect(meta.total).toBe(1);

        // The controller must translate `analysisId` into the telemetry
        // LABELS the log store actually indexes.
        expect(telemetryRequests).toHaveLength(1);
        const query = decodeURIComponent(telemetryRequests[0].url);
        expect(query).toContain(LogFlag.REF_TYPE);
        expect(query).toContain(DomainType.ANALYSIS);
        expect(query).toContain(ANALYSIS_ID);
    });

    it('should reject a collection read without an analysisId filter', async () => {
        const { client } = suite;

        await expect(client.analysisLog.getMany()).rejects.toThrow();
    });

    it('should attach the queryable vocabulary at meta.schema', async () => {
        const { client } = suite;

        const { meta } = await client.analysisLog.getMany({ filters: { analysisId: ANALYSIS_ID } });

        expect(meta.schema).toBeDefined();
    });

    it('should delete through the telemetry store', async () => {
        const { client } = suite;

        await client.analysisLog.delete({ filters: { analysisId: ANALYSIS_ID } });

        expect(telemetryRequests).toHaveLength(1);
        const query = decodeURIComponent(telemetryRequests[0].url);
        expect(query).toContain(ANALYSIS_ID);
    });

    it('should reject a delete without an analysisId filter', async () => {
        const { client } = suite;

        await expect(client.analysisLog.delete({})).rejects.toThrow();
    });

    // Regressions: the proxy forwards with server-core's OWN service
    // credentials, so a missing gate here let any logged-in caller read and
    // delete every analysis' logs.
    const request = async (method: string, path: string, token: string) => {
        const baseURL = suite.client.getBaseURL().replace(/\/+$/, '');
        const response = await fetch(`${baseURL}${path}`, { method, headers: { authorization: `Bearer ${token}` } });
        return response.status;
    };

    it('should refuse a delete without ANALYSIS_UPDATE and never reach the store', async () => {
        const status = await request(
            'DELETE',
            `/analysis-logs?filter[analysisId]=${ANALYSIS_ID}`,
            await createRestrictedAccessToken(),
        );

        expect(status).toBe(403);
        expect(telemetryRequests).toHaveLength(0);
    });

    it('should let a holder of ANALYSIS_UPDATE delete', async () => {
        const status = await request(
            'DELETE',
            `/analysis-logs?filter[analysisId]=${ANALYSIS_ID}`,
            await createRestrictedAccessToken([PermissionName.ANALYSIS_UPDATE]),
        );

        expect(status).toBe(202);
        expect(telemetryRequests).toHaveLength(1);
    });
});
