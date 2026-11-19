/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { FakePermissionEvaluator } from '@authup/server-test-kit';
import type { AppOptionsInput } from 'routup';
import { App, defineCoreHandler } from 'routup';
import { toNodeHandler } from 'routup/node';
import { describe, expect, it } from 'vitest';
import { buildActorContext, setRequestEnv } from '../../../src/request/index.ts';

async function auditIP(trustProxy: AppOptionsInput['trustProxy'], forwardedFor: string) {
    const app = new App({ options: { trustProxy } });

    app.get('/', defineCoreHandler((event) => {
        setRequestEnv(event, 'permissionEvaluator', new FakePermissionEvaluator());

        return { ip: buildActorContext(event).metadata.requestIpAddress ?? null };
    }));

    // A real socket: the trusted hops are counted from the peer address,
    // which app.fetch() does not have.
    const server = createServer(toNodeHandler(app));

    await new Promise<void>((resolve) => {
        server.listen(0, '127.0.0.1', resolve);
    });

    try {
        const { port } = server.address() as AddressInfo;
        const response = await fetch(`http://127.0.0.1:${port}/`, { headers: { 'x-forwarded-for': forwardedFor } });
        const { ip } = await response.json();

        return ip;
    } finally {
        await new Promise((resolve) => {
            server.close(resolve);
        });
    }
}

describe('buildActorContext: request ip', () => {
    it('takes the leftmost forwarded address when every hop is trusted', async () => {
        expect(await auditIP(true, '198.51.100.1, 203.0.113.7')).toBe('198.51.100.1');
    });

    it('ignores a forged address beyond the trusted hops', async () => {
        expect(await auditIP(1, '198.51.100.1, 203.0.113.7')).toBe('203.0.113.7');
    });
});
