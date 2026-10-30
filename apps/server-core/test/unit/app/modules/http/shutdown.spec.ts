/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createAdminAccessToken } from '@privateaim/server-test-kit';
import { describe, expect, it } from 'vitest';
import { HTTPInjectionKey, HTTPModule } from '../../../../../src/app/modules/http/index.ts';
import { createTestApplication } from '../../../../app/index.ts';

describe('HTTPModule shutdown', () => {
    it('completes teardown and disconnects a live WebSocket', async () => {
        const suite = createTestApplication();

        suite.addModule(new HTTPModule({ socket: true }));

        let client: WebSocket | undefined;
        let teardown: Promise<void> | undefined;
        let timeout: ReturnType<typeof setTimeout> | undefined;

        try {
            await suite.setup();

            const server = suite.container.resolve(HTTPInjectionKey.Server);
            const url = new URL('/socket.io/?EIO=4&transport=websocket', server.url);

            url.protocol = 'ws:';

            const token = await createAdminAccessToken();
            const socket = new WebSocket(url);

            client = socket;

            await new Promise<void>((resolve, reject) => {
                timeout = setTimeout(() => reject(new Error('WebSocket connection did not settle')), 5000);
                socket.onerror = () => reject(new Error('WebSocket connection failed'));
                socket.onmessage = (event) => {
                    const packet = String(event.data);

                    if (packet.startsWith('0')) {
                        socket.send(`40/resources,${JSON.stringify({ token })}`);
                    } else if (packet.startsWith('40/resources,')) {
                        resolve();
                    } else if (packet.startsWith('44/resources,')) {
                        reject(new Error(`WebSocket authorization failed: ${packet}`));
                    }
                };
            });
            clearTimeout(timeout);

            expect(socket.readyState).toBe(WebSocket.OPEN);

            const disconnected = new Promise<void>((resolve) => {
                socket.onclose = () => resolve();
            });

            teardown = suite.teardown();

            await Promise.race([
                Promise.all([teardown, disconnected]),
                new Promise<never>((_resolve, reject) => {
                    timeout = setTimeout(() => reject(new Error('Socket shutdown did not settle')), 1000);
                }),
            ]);

            expect(socket.readyState).toBe(WebSocket.CLOSED);
            expect(server.node!.server.listening).toBe(false);
            expect(suite.container.tryResolve(HTTPInjectionKey.Server).success).toBe(false);
        } finally {
            clearTimeout(timeout);
            client?.close();
            await (teardown ?? suite.teardown());
        }
    });
});
