/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Server as HTTPServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { IContainer } from 'eldin';
import type * as Routup from 'routup';
import type * as ServerHTTPKit from '@privateaim/server-http-kit';
import { EnvironmentName, LoggerInjectionKey } from '@privateaim/server-kit';
import { Server } from 'socket.io';
import {
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import { HTTPModule } from '../../../../../src/app/modules/http/module.ts';
import { ConfigInjectionKey } from '../../../../../src/app/modules/config/constants.ts';
import { HTTPInjectionKey } from '../../../../../src/app/modules/http/constants.ts';

const state = vi.hoisted(() => ({ order: [] as string[] }));

vi.mock('routup', async (original) => {
    const actual = await original<typeof Routup>();

    return {
        ...actual,
        serve: (...args: Parameters<typeof actual.serve>) => {
            const server = actual.serve(...args);
            const close = server.close.bind(server);

            server.close = async (...closeArgs) => {
                state.order.push('http');

                return close(...closeArgs);
            };

            return server;
        },
    };
});

vi.mock('@privateaim/server-http-kit', async (original) => ({
    ...await original<typeof ServerHTTPKit>(),
    mountMiddlewares: vi.fn(),
    mountErrorMiddleware: vi.fn(),
    createAuthupTokenVerifier: vi.fn(),
}));

vi.mock('../../../../../src/app/modules/http/controller.ts', () => ({ createControllers: () => [] }));

vi.mock('../../../../../src/adapters/socket/server.ts', () => ({
    createSocketServer: (httpServer: HTTPServer) => {
        const socket = new Server(httpServer);
        const close = socket.close.bind(socket);

        socket.close = async (...args) => {
            state.order.push('socket');

            return close(...args);
        };

        return socket;
    },
}));

describe('HTTPModule shutdown', () => {
    it('disconnects an upgraded socket before closing HTTP', async () => {
        state.order.length = 0;

        const entries = new Map<unknown, unknown>();
        const container = {
            resolve: (key: unknown) => {
                if (key === ConfigInjectionKey) {
                    return { env: EnvironmentName.TEST, port: 0 };
                }

                if (key === LoggerInjectionKey) {
                    return { debug: vi.fn() };
                }

                return {};
            },
            tryResolve: () => ({ success: false }),
            register: (key: unknown, value: { useValue: unknown }) => entries.set(key, value.useValue),
            unregister: (key: unknown) => entries.delete(key),
        } as unknown as IContainer;
        const module = new HTTPModule({ socket: true });

        await module.setup(container);

        const http = entries.get(HTTPInjectionKey.Server) as { node: { server: HTTPServer } };
        const address = http.node.server.address() as AddressInfo;
        const client = new WebSocket(`ws://127.0.0.1:${address.port}/socket.io/?EIO=4&transport=websocket`);

        let timeout: ReturnType<typeof setTimeout> | undefined;

        try {
            await new Promise<void>((resolve, reject) => {
                client.onerror = () => reject(new Error('WebSocket connection failed'));
                client.onmessage = (event) => {
                    if (String(event.data).startsWith('0')) {
                        client.send('40');
                    }

                    if (String(event.data).startsWith('40')) {
                        resolve();
                    }
                };
            });

            const disconnected = new Promise<void>((resolve) => {
                client.onclose = () => resolve();
            });

            await Promise.race([
                Promise.all([module.teardown(container), disconnected]),
                new Promise<never>((_resolve, reject) => {
                    timeout = setTimeout(() => reject(new Error('Socket shutdown did not settle')), 1000);
                }),
            ]);
            expect(state.order).toEqual(['socket', 'http']);
        } finally {
            clearTimeout(timeout);
            client.close();
            await module.teardown(container);
        }
    }, 5000);
});
