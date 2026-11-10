/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Analysis, AnalysisBucket } from '@privateaim/core-kit';
import { AnalysisBucketType } from '@privateaim/core-kit';
import { createAdminAccessToken, createRestrictedAccessToken } from '@privateaim/server-test-kit';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { createTestApplication } from '../../../app';
import { createTestProject } from '../../../utils/domains';

function decodePayload(token: string): Record<string, any> {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
}

describe('analysis/storage-token', () => {
    const suite = createTestApplication();

    let analysis: Analysis;
    let codeBucket: AnalysisBucket;

    beforeAll(async () => {
        await suite.setup();

        const { client } = suite;

        const { data: project } = await client.project.create(createTestProject());
        const { data: analysisRecord } = await client.analysis.create({ projectId: project.id });

        analysis = analysisRecord;

        const { data: bucket } = await client.analysisBucket.create({
            analysisId: analysis.id,
            bucketId: randomUUID(),
            type: AnalysisBucketType.CODE,
        });

        codeBucket = bucket;
    });

    afterAll(async () => {
        await suite.teardown();
    });

    async function mint(token: string, body: Record<string, any>) {
        const response = await fetch(`${suite.url}analyses/${analysis.id}/storage-tokens`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        return { status: response.status, body: await response.json() };
    }

    it('should mint a capability token for the owner', async () => {
        const cap = [`bucket:${codeBucket.bucketId}:read`];
        const { status, body } = await mint(await createAdminAccessToken(), { cap, lifetime: 60 });

        expect(status).toEqual(200);
        expect(body.data).toBeUndefined();

        const payload = decodePayload(body.token);

        expect(payload.kind).toEqual('capability_token');
        expect(payload.cap).toEqual(cap);
        expect(payload.exp - payload.iat).toBeLessThanOrEqual(60);
        expect(Number.isNaN(Date.parse(body.expiresAt))).toBe(false);
    });

    it('should refuse a user without any grant', async () => {
        const { status } = await mint(
            await createRestrictedAccessToken([]),
            { cap: [`bucket:${codeBucket.bucketId}:read`] },
        );

        expect(status).toEqual(403);
    });

    it('should refuse a malformed entry', async () => {
        const { status } = await mint(await createAdminAccessToken(), { cap: ['nonsense'] });

        expect(status).toEqual(400);
    });
});
