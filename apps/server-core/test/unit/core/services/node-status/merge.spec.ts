/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { NodeComponent } from '@privateaim/core-kit';
import { describe, expect, it } from 'vitest';
import { mergeNodeComponent } from '../../../../../src/core/services/node-status/merge';

const reportedAt = '2026-11-25T10:00:00.000Z';

function makeStored(overrides: Partial<NodeComponent> = {}): NodeComponent {
    return {
        id: 'c1',
        nodeId: 'n1',
        name: 'hub-adapter',
        version: null,
        status: 'ok',
        message: null,
        latency: null,
        uptime: null,
        checksTotal: null,
        checksSuccessful: null,
        reportedAt: '2026-01-01T00:00:00.000Z',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        ...overrides,
    };
}

describe('mergeNodeComponent', () => {
    it('fills unset columns with null when nothing is stored', () => {
        expect(mergeNodeComponent(undefined, { status: 'ok', version: '0.5.1' }, reportedAt)).toEqual({
            status: 'ok',
            version: '0.5.1',
            message: null,
            latency: null,
            uptime: null,
            checksTotal: null,
            checksSuccessful: null,
            reportedAt,
        });
    });

    it('keeps the stored version for a null report value', () => {
        const result = mergeNodeComponent(makeStored({ version: '0.5.1' }), { status: 'ok', version: null }, reportedAt);

        expect(result.version).toBe('0.5.1');
    });

    it('keeps the stored version for an omitted report value', () => {
        const result = mergeNodeComponent(makeStored({ version: '0.5.1' }), { status: 'ok' }, reportedAt);

        expect(result.version).toBe('0.5.1');
    });

    it('keeps probe fields for a component report', () => {
        const result = mergeNodeComponent(makeStored({ checksTotal: 1310 }), { status: 'ok' }, reportedAt);

        expect(result.checksTotal).toBe(1310);
    });

    it('replaces probe fields when a probe report carries them', () => {
        const result = mergeNodeComponent(
            makeStored({ latency: 5, checksTotal: 1 }),
            {
                name: 'hub-adapter', 
                status: 'ok', 
                latency: 9, 
                checksTotal: null,
            },
            reportedAt,
        );

        expect(result.latency).toBe(9);
        expect(result.checksTotal).toBe(1);
    });

    it('clears the stored message when the report has none', () => {
        const result = mergeNodeComponent(makeStored({ status: 'error', message: 'timeout' }), { status: 'ok' }, reportedAt);

        expect(result.message).toBeNull();
    });

    it('takes the reported message', () => {
        const result = mergeNodeComponent(undefined, { status: 'error', message: 'x' }, reportedAt);

        expect(result.message).toBe('x');
    });

    it('stamps the passed reportedAt', () => {
        const result = mergeNodeComponent(makeStored(), { status: 'ok' }, reportedAt);

        expect(result.reportedAt).toBe(reportedAt);
    });
});
