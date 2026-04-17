/*
 * Copyright (c) 2025.
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
import { DatabaseInjectionKey } from '../../../src/app/modules/database/index.ts';
import { AnalysisNodeSubscriber } from '../../../src/adapters/database/subscribers/analysis/node.ts';
import { AnalysisSubscriber } from '../../../src/adapters/database/subscribers/analysis/module.ts';
import { AnalysisBucketFileSubscriber } from '../../../src/adapters/database/subscribers/analysis/bucket-file.ts';
import { createTestDatabaseApplication } from '../../app';

describe('subscriber registration', () => {
    const suite = createTestDatabaseApplication();

    beforeAll(async () => {
        await suite.setup();
    });

    afterAll(async () => {
        await suite.teardown();
    });

    it('should have subscribers registered on the DataSource', () => {
        const dataSource = suite.container.resolve(DatabaseInjectionKey.DataSource);

        expect(dataSource.subscribers.length).toBeGreaterThan(0);

        const hasAnalysisSubscriber = dataSource.subscribers.some(
            (s: any) => s instanceof AnalysisSubscriber,
        );
        const hasNodeSubscriber = dataSource.subscribers.some(
            (s: any) => s instanceof AnalysisNodeSubscriber,
        );
        const hasBucketFileSubscriber = dataSource.subscribers.some(
            (s: any) => s instanceof AnalysisBucketFileSubscriber,
        );

        expect(hasAnalysisSubscriber).toBe(true);
        expect(hasNodeSubscriber).toBe(true);
        expect(hasBucketFileSubscriber).toBe(true);
    });

    it('should have same subscriber instances in container and DataSource', () => {
        const dataSource = suite.container.resolve(DatabaseInjectionKey.DataSource);

        const containerSub = suite.container.resolve(DatabaseInjectionKey.AnalysisNodeSubscriber);
        const dsSubscriber = dataSource.subscribers.find(
            (s: any) => s instanceof AnalysisNodeSubscriber,
        );

        expect(containerSub).toBe(dsSubscriber);
    });
});
