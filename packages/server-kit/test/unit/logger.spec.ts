/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { wait } from '@privateaim/kit';
import { MemoryLogStore, createLogger } from '../../src';

describe('logger', () => {
    it('should work with store', async () => {
        const store = new MemoryLogStore();
        const logger = createLogger({
            store,
            labels: {
                app: 'app',
            },
        });

        logger.info('foo', { meta: 'bar' });

        await wait(0);

        expect(store.items).toHaveLength(1);

        const [item] = store.items;

        expect(item.message).toEqual('foo');
        expect(item.labels).toEqual({
            app: 'app',
            level: 'info',
            meta: 'bar',
        });
        expect(item.time).toBeDefined();
    });
});
