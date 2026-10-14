/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
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

// `AnalysisLogController` proxies the telemetry log store, so it could not be
// exercised at all without either a live telemetry service or this opt-in
// transport-level fake. The fake also lets the spec assert the LABEL mapping
// the controller performs — analysisId -> refType/refId — which is the
// controller's entire job and was previously unverified.

const ANALYSIS_ID = '11111111-1111-1111-1111-111111111111';

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

    beforeAll(async () => {
        await suite.setup();
    });

    // Reset per test: asserting on `telemetryRequests[length - 1]` would
    // otherwise couple each case to the execution order of the ones before it.
    beforeEach(() => {
        telemetryRequests.length = 0;
    });

    afterAll(async () => {
        await suite.teardown();
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
});
