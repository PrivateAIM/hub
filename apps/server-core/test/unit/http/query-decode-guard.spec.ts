/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildQueryString } from '@privateaim/core-http-kit';
import type { Node } from '@privateaim/core-kit';
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

    const requestErrorBody = async (path: string): Promise<Record<string, any>> => suite.client
        .get(path)
        .then(
            () => { throw new Error(`Expected ${path} to be rejected.`); },
            (error) => error.response.data,
        );

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

    // The v2 expression dialect is what the HTTP kits emit (`buildQueryString`),
    // and it is the strict one: the legacy bracket form prunes a disallowed key
    // silently, so only this dialect reaches the trace at all.
    const strictQuery = (input: Parameters<typeof buildQueryString<Node>>[0]) => `nodes${buildQueryString<Node>(input)}`;

    // Since @rapiq/core 2.2 a parse collects every violation and raises ONE
    // aggregate error whose message is just a count, so the response message
    // alone no longer says what was wrong. The trace `sanitizeError` forwards
    // is the only thing that names the rejected key — without it the client
    // gets a 400 it cannot act on.
    it('answers a rejected filter key with a trace naming the key', async () => {
        const body = await requestErrorBody(strictQuery({ filters: { publicKey: 'x' } }));

        expect(body.statusCode).toEqual(400);
        expect(body.code).toEqual('bad_request');
        expect(body.issues).toHaveLength(1);
        expect(body.issues[0]).toMatchObject({
            type: 'item',
            code: 'keyNotAllowed',
            path: ['publicKey'],
        });
    });

    // This is WHY the trace has to be forwarded rather than being a nice extra.
    // The aggregate's message is a bare count, so it names nothing; drop the
    // trace and a rejected query answers 400 with no way to tell which key was
    // at fault.
    it('does not name the rejected key anywhere but the trace', async () => {
        const body = await requestErrorBody(strictQuery({ filters: { publicKey: 'x' } }));

        expect(body.message).not.toContain('publicKey');
        expect(JSON.stringify(body.issues)).toContain('publicKey');
    });

    // Only the FIRST violation surfaces, and that is hub's decode configuration
    // rather than a rapiq limit: the expression dialect throws structurally on a
    // disallowed filter key, which ends the parse, while the other parameters
    // run in rapiq's default drop mode and prune silently. Adopting
    // `throwOnFailure` across every parameter is what would make the trace
    // report a whole query at once.
    it('carries one issue per aggregate under the current decode configuration', async () => {
        const body = await requestErrorBody(strictQuery({ filters: { publicKey: 'x', type: 'y' } }));

        expect(body.issues).toHaveLength(1);
    });
});
