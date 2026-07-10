/*
 * The expected-limit roll-up semantics: per-pair values are PER-CONNECTION
 * limits.
 *   pair view      → 1× the per-pair value
 *   direction view → per-pair value × distinct pairs of that direction
 *   category view  → exact sum over both directions
 */
import {
    describe,
    expect,
    it,
} from 'vitest';
import type { CommunicationMeasurement, ExpectedConfig } from '../../src';
import {
    CommunicationCategory,
    applyExpectedLimits,
    projectByDetail,
} from '../../src';

const A2G = 'analyzer → aggregator';
const G2A = 'aggregator → analyzer';

const event = (pair: string, direction: string, bytes: number) => ({
    time: 0,
    bytes,
    pair,
    direction,
});

const base : CommunicationMeasurement[] = [
    {
        category: CommunicationCategory.NODE_TO_NODE,
        title: 'Node-to-Node',
        unit: 'bytes',
        source: 'hub',
        events: [
            // two analyzers send to the aggregator; it answers one of them
            event('node1 (analyzer) → node4 (aggregator)', A2G, 100),
            event('node2 (analyzer) → node4 (aggregator)', A2G, 100),
            event('node4 (aggregator) → node1 (analyzer)', G2A, 50),
        ],
    },
    {
        category: CommunicationCategory.RESULT_DATA,
        title: 'Result',
        unit: 'bytes',
        source: 'hub',
        events: [event('node4 (aggregator) → Result', 'aggregator → result', 500)],
    },
];

const config : ExpectedConfig = {
    perPairByDirection: {
        [A2G]: { count: 2, bytes: 1000 },
        [G2A]: { count: 1, bytes: 500 },
    },
    generalByCategory: { [CommunicationCategory.RESULT_DATA]: { count: 1, bytes: 2048 } },
};

const limitsOf = (measurements: CommunicationMeasurement[], title: string) => {
    const m = measurements.find((x) => x.title === title);
    return { count: m?.expectedCount, bytes: m?.expectedBytes };
};

describe('applyExpectedLimits roll-up', () => {
    it('category view: limit = exact sum over directions × their distinct pairs', () => {
        const out = applyExpectedLimits(projectByDetail(base, 'category'), config);
        // A2G: 2 pairs × (2, 1000) + G2A: 1 pair × (1, 500)
        expect(limitsOf(out, 'Node-to-Node')).toEqual({ count: 5, bytes: 2500 });
    });

    it('direction view: limit = per-pair value × distinct receiving pairs (not a shared total)', () => {
        const out = applyExpectedLimits(projectByDetail(base, 'direction'), config);
        expect(limitsOf(out, A2G)).toEqual({ count: 4, bytes: 2000 });
        expect(limitsOf(out, G2A)).toEqual({ count: 1, bytes: 500 });
    });

    it('pair view: each connection gets exactly 1× the per-pair value', () => {
        const out = applyExpectedLimits(projectByDetail(base, 'pair'), config);
        expect(limitsOf(out, 'node1 (analyzer) → node4 (aggregator)')).toEqual({ count: 2, bytes: 1000 });
        expect(limitsOf(out, 'node2 (analyzer) → node4 (aggregator)')).toEqual({ count: 2, bytes: 1000 });
        expect(limitsOf(out, 'node4 (aggregator) → node1 (analyzer)')).toEqual({ count: 1, bytes: 500 });
    });

    it('non-node-to-node categories take their configured value directly in every view', () => {
        for (const detail of ['category', 'direction', 'pair'] as const) {
            const out = applyExpectedLimits(projectByDetail(base, detail), config);
            const result = out.find((m) => m.category === CommunicationCategory.RESULT_DATA);
            expect(result?.expectedCount).toBe(1);
            expect(result?.expectedBytes).toBe(2048);
        }
    });
});

describe('projectByDetail', () => {
    it('category detail returns the base measurements unchanged', () => {
        expect(projectByDetail(base, 'category')).toBe(base);
    });

    it('splits by pair with stable group keys', () => {
        const out = projectByDetail(base, 'pair');
        const n2n = out.filter((m) => m.category === CommunicationCategory.NODE_TO_NODE);
        expect(n2n).toHaveLength(3);
        for (const m of n2n) {
            expect(m.key).toBe(`${CommunicationCategory.NODE_TO_NODE}:${m.title}`);
        }
    });
});
