/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { App, defineCoreHandler } from 'routup';
import { describe, expect, it } from 'vitest';
import { mountPrometheusMiddleware } from '../../../src/middlewares/index.ts';

describe('mountPrometheusMiddleware', () => {
    it('labels requests by route pattern and folds unmatched ones into one series', async () => {
        const app = new App();

        mountPrometheusMiddleware(app);
        app.get('/nodes/:id', defineCoreHandler(() => ({ ok: true })));

        await app.fetch(new Request('http://hub.test/nodes/b0b9a0f6-0d5d-4c35-8d2e-0e1a8f5a9d11'));
        await app.fetch(new Request('http://hub.test/wp-admin/setup.php'));
        await app.fetch(new Request('http://hub.test/.env'));
        await app.fetch(new Request('http://hub.test/metrics'));

        const response = await app.fetch(new Request('http://hub.test/metrics'));
        const text = await response.text();

        expect(text).toContain('path="/nodes/:id"');
        expect(text).toContain('path="/{unmatched}"');
        expect(text).not.toContain('b0b9a0f6');
        expect(text).not.toContain('wp-admin');
        expect(text).not.toContain('path="/metrics"');
    });
});
