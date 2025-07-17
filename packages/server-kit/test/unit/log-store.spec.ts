/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { MemoryLogStore } from '../../src';

describe('log-store', () => {
    it('should permit label management', () => {
        const store = new MemoryLogStore();
        store.setLabels({ app: 'app' });
        store.extendLabels({ foo: 'bar' });

        expect(store.getLabels()).toEqual({
            app: 'app',
            foo: 'bar',
        });
    });
});
