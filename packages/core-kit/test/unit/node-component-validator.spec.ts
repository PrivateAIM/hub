/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { NodeComponentReportValidator, NodeStatusReportValidator } from '../../src';

describe('NodeStatusReportValidator', () => {
    const validator = new NodeStatusReportValidator();
    const component = {
        name: 'pod-orchestrator',
        status: 'ok' as const,
        version: '0.2.2',
        latency: 12.4,
        uptime: 180000,
        checksTotal: 1310,
        checksSuccessful: 1308,
    };

    it('accepts a full snapshot unchanged', async () => {
        await expect(validator.run({ components: [component] })).resolves.toEqual({ components: [component] });
    });

    it('accepts a deployment', async () => {
        const input = { deployment: { name: 'flame', version: '1.0.0' }, components: [component] };

        await expect(validator.run(input)).resolves.toEqual(input);
    });

    it('preserves null values', async () => {
        const input = {
            components: [{
                name: 'a', 
                status: 'ok' as const, 
                version: null, 
                message: null, 
                uptime: null, 
                latency: null, 
                checksTotal: null, 
                checksSuccessful: null,
            }],
        };

        await expect(validator.run(input)).resolves.toEqual(input);
    });

    it.each([
        { components: [] },
        { components: [component, component] },
        { components: [{ ...component, name: 'Pod Orch' }] },
        { components: [{ ...component, status: 'down' }] },
        {
            components: [{
                ...component, 
                checksSuccessful: 5, 
                checksTotal: 4, 
            }], 
        },
        { components: [{ ...component, latency: -1 }] },
        { components: [{ ...component, uptime: 1.5 }] },
        { components: [{ ...component, message: 'x'.repeat(1025) }] },
        { components: [{ ...component, extra: 1 }] },
        { deployment: { name: 'x' }, components: [component] },
    ] as Record<string, any>[])('rejects %#', async (input) => {
        await expect(validator.run(input)).rejects.toBeDefined();
    });
});

describe('NodeComponentReportValidator', () => {
    const validator = new NodeComponentReportValidator();

    it('accepts a report', async () => {
        const input = {
            status: 'ok' as const, 
            version: '0.5.1', 
            uptime: 4200, 
        };

        await expect(validator.run(input)).resolves.toEqual(input);
    });

    it.each([
        { status: 'ok', latency: 3 },
        { status: 'ok', checksTotal: 3 },
        {},
    ] as Record<string, any>[])('rejects %#', async (input) => {
        await expect(validator.run(input)).rejects.toBeDefined();
    });
});
