/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { wait } from '@privateaim/kit';
import { LogChannel, LogLevel } from '@privateaim/telemetry-kit';
import { createTestSuite } from '../../utils';

describe('controllers > analysis-node-log', () => {
    const suite = createTestSuite();

    beforeAll(async () => {
        await suite.up();
    });

    afterAll(async () => {
        await suite.down();
    });

    it('should create resource', async () => {
        const client = suite.client();

        const response = await client.log.create({
            channel: LogChannel.SYSTEM,
            service: 'unknown',
            level: LogLevel.ERROR,
            message: 'An test error occurred.',
            labels: {
                foo: 'bar',
            },
        });

        expect(response.channel).toEqual(LogChannel.SYSTEM);
        expect(response.time).toBeDefined();
        expect(response.level).toEqual(LogLevel.ERROR);
        expect(response.message).toEqual('An test error occurred.');
        expect(response.labels).toBeDefined();
        expect(response.labels.foo).toEqual('bar');
    });

    it('should read collection', async () => {
        const client = suite.client();

        // VL safes log to buffer first before writing to disk.
        await wait(1_000);

        const result = await client.log
            .getMany({
                filters: {
                    labels: {
                        foo: 'bar',
                    },
                },
            });

        expect(result.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should delete resource', async () => {
        const client = suite.client();

        await client.log.deleteMany({
            filters: {
                labels: {
                    foo: 'bar',
                },
            },
        });
    });
});
