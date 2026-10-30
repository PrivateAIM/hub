/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const fixture = fileURLToPath(new URL('../fixtures/start-application.mjs', import.meta.url));

describe('startApplication', () => {
    it.each(['SIGTERM', 'SIGINT'] as const)('awaits teardown once on %s', async (signal) => {
        const child = fork(fixture, [], { stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
        const messages: string[] = [];

        child.on('message', (message: string) => {
            messages.push(message);

            if (message === 'ready' || message === 'teardown') {
                child.kill(signal);
            }
        });

        const code = await new Promise<number | null>((resolve) => {
            child.on('exit', resolve); 
        });

        expect(code).toBe(0);
        expect(messages).toEqual(['ready', 'teardown', 'finished']);
    });

    it('waits for setup before tearing down when signalled during startup', async () => {
        const child = fork(fixture, ['starting'], { stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
        const messages: string[] = [];

        child.on('message', (message: string) => {
            messages.push(message);

            if (message === 'starting') {
                child.kill('SIGTERM');
            }
        });

        const code = await new Promise<number | null>((resolve) => {
            child.on('exit', resolve); 
        });

        expect(code).toBe(0);
        expect(messages).toContain('setup-finished');
        expect(messages.indexOf('teardown')).toBeGreaterThan(messages.indexOf('setup-finished'));
        expect(messages).toContain('finished');
    });

    it.each(['timeout', 'linger'])('bounds shutdown when %s leaves the process alive', async (mode) => {
        const child = fork(fixture, [mode], { stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });

        child.on('message', (message) => {
            if (message === 'ready') {
                child.kill('SIGTERM');
            }
        });

        const code = await new Promise<number | null>((resolve) => {
            child.on('exit', resolve); 
        });

        expect(code).toBe(1);
    });

    it.each(['setup-fail', 'ready-fail'])('cleans up a real Orkos application after %s during a signal', async (mode) => {
        const child = fork(fixture, [mode], { stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
        const messages: string[] = [];

        child.on('message', (message: string) => {
            messages.push(message);

            if (message === 'starting') {
                child.kill('SIGTERM');
            }
        });

        const code = await new Promise<number | null>((resolve) => {
            child.on('exit', resolve);
        });

        expect(code).toBe(1);
        expect(messages).toEqual(['starting', 'teardown']);
    });

    it('drains buffered output before exiting', async () => {
        const child = fork(fixture, ['output'], { stdio: ['ignore', 'pipe', 'pipe', 'ipc'] });
        let output = '';

        child.stdout!.on('data', (chunk) => {
            output += chunk; 
        });
        child.on('message', (message: string) => {
            if (message === 'ready') {
                child.kill('SIGTERM');
            }
        });

        const code = await new Promise<number | null>((resolve) => {
            child.on('close', resolve);
        });

        expect(code).toBe(0);
        expect(output).toBe('x'.repeat(1_000_000));
    });

    it('exits unsuccessfully when teardown fails', async () => {
        const child = fork(fixture, ['fail'], { stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });

        child.on('message', (message) => {
            if (message === 'ready') {
                child.kill('SIGTERM');
            }
        });

        const code = await new Promise<number | null>((resolve) => {
            child.on('exit', resolve); 
        });

        expect(code).toBe(1);
    });
});
