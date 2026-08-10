/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isClientErrorWithStatusCode } from 'hapic';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { createTestApplication } from '../../app';

// Wire-level half of the key-path guard added in @rapiq/core 2.0.0-beta.17
// (the decode seam itself is pinned by
// `test/unit/core/query/decode-key-path-guard.spec.ts`): a query smuggling a
// `__proto__`/`constructor`/`prototype` path segment must come back as a 400 —
// the guard's ParseError routed through `sanitizeError` — never a 500, and
// never a 200 that silently accepted the key.
describe('src/adapters/http (query decode guard)', () => {
    const suite = createTestApplication();

    beforeAll(async () => {
        await suite.setup();
    });

    afterAll(async () => {
        await suite.teardown();
    });

    const requestStatus = async (path: string): Promise<unknown> => suite.client
        .get(path)
        .then(() => 200, (error) => (isClientErrorWithStatusCode(error, 400) ? 400 : error));

    it('rejects a prototype-polluting sort path with 400', async () => {
        expect(await requestStatus('nodes?sort=__proto__.x')).toEqual(400);
    });

    it('rejects a prototype-polluting fields selection with 400', async () => {
        expect(await requestStatus('nodes?fields=__proto__')).toEqual(400);
    });

    it('rejects a prototype-polluting filter key with 400', async () => {
        expect(await requestStatus('nodes?filter[__proto__.x]=1')).toEqual(400);
    });

    it('rejects a prototype-polluting include path with 400', async () => {
        expect(await requestStatus('nodes?include=__proto__.x')).toEqual(400);
    });
});
