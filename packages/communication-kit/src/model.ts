/*
 * Generic communication measurement model.
 *
 * The dashboard renders *categories of measurements* without knowing in
 * advance what they are. New sources (SDK epsilon values, endpoint counts,
 * self-reported claims, ...) only have to emit data in this shape — the
 * rendering components never change.
 */

import type {
    CommunicationDetail,
    CommunicationEvent,
    CommunicationMeasurement,
    ExpectedConfig,
} from './types';

export enum CommunicationCategory {
    NODE_TO_NODE = 'node_to_node',
    NODE_TO_HUB = 'node_to_hub',
    INPUT_DATA = 'input_data',
    RESULT_DATA = 'result_data',
    API_CALL = 'api_call',
    SDK = 'sdk',
    SELF_REPORTED = 'self_reported',
}

// ---------------------------------------------------------------------------

export const COMMUNICATION_CATEGORY_META : Record<CommunicationCategory, { label: string, color: string }> = {
    [CommunicationCategory.NODE_TO_NODE]: { label: 'Node-to-Node', color: 'var(--privateaim-brand-blue, #4d7fff)' },
    [CommunicationCategory.NODE_TO_HUB]: { label: 'Node-to-Hub', color: 'var(--privateaim-brand-teal, #2bb6a8)' },
    [CommunicationCategory.INPUT_DATA]: { label: 'Input-Data', color: 'var(--privateaim-brand-purple, #9b6dff)' },
    [CommunicationCategory.RESULT_DATA]: { label: 'Result', color: 'var(--privateaim-brand-coral, #ff6f61)' },
    [CommunicationCategory.API_CALL]: { label: 'API Calls', color: 'var(--privateaim-brand-rust, #c2562f)' },
    [CommunicationCategory.SDK]: { label: 'SDK', color: 'var(--privateaim-brand-purple, #9b6dff)' },
    [CommunicationCategory.SELF_REPORTED]: { label: 'Self-Reported', color: 'var(--vc-color-fg-muted, #888)' },
};

export const COMMUNICATION_SERIES_PALETTE : string[] = [
    'var(--privateaim-brand-blue, #4d7fff)',
    'var(--privateaim-brand-coral, #ff6f61)',
    'var(--privateaim-brand-teal, #2bb6a8)',
    'var(--privateaim-brand-purple, #9b6dff)',
    'var(--privateaim-brand-rust, #c2562f)',
];

/** stable colour for an arbitrary group key */
export function seriesColor(key: string, index: number) : string {
    return COMMUNICATION_SERIES_PALETTE[index % COMMUNICATION_SERIES_PALETTE.length];
}

/** resolve the display colour of a measurement (explicit > category meta > grey) */
export function measurementColor(m: CommunicationMeasurement) : string {
    if (m.color) {
        return m.color;
    }

    return COMMUNICATION_CATEGORY_META[m.category]?.color || 'var(--vc-color-fg-muted, #888)';
}

/** resolve the unique key of a measurement */
export function measurementKey(m: CommunicationMeasurement) : string {
    return m.key || m.category;
}

// Line style (dash) encodes DIRECTION as a channel independent of colour.
// Outbound flows (toward the aggregator, or out as the result) are solid; the
// return direction (-> analyzer / -> node, i.e. aggregator -> node) is dashed.
// A couple of dash levels are well within the perceptually distinct range.
export function directionDash(direction: string | undefined) : string | undefined {
    if (!direction) {
        return undefined;
    }

    const d = direction.toLowerCase();

    if (/\u2192\s*analyzer|\u2192\s*node/.test(d) || /aggregator\s*\u2192/.test(d)) {
        return '6 4';
    }

    return undefined; // solid (outbound / toward aggregator or result)
}

/** resolve the dash pattern of a measurement (explicit > none) */
export function measurementDash(m: CommunicationMeasurement) : string | undefined {
    return m.dash;
}

/**
 * Count the distinct sending nodes in a measurement's events. The sender is the
 * token before the arrow in an event's `pair` (falling back to `direction`).
 */
export function distinctSenders(events: CommunicationEvent[]) : number {
    const senders = new Set<string>();

    for (const e of events) {
        const src = (e.pair || e.direction || '').split('\u2192')[0].trim();

        if (src) {
            senders.add(src);
        }
    }

    return senders.size;
}

/**
 * Apply expected values as upper limits to whatever measurements are being
 * displayed (category, direction or node-pair view), getting the maths right in
 * every view from a single configuration:
 *
 *  - Node-to-Node is configured PER NODE PAIR (per connection) for each
 *    direction. A displayed group's limit is the sum, over the directions it
 *    contains, of
 *      (per-pair value for that direction) x (distinct node pairs of that
 *      direction present in the group).
 *    This makes the per-pair value behave as a PER-CONNECTION limit, not a shared
 *    budget: a single node-pair row uses one individual limit; a direction row
 *    uses one limit per connection (e.g. aggregator -> analyzer across two
 *    analyzers = 2x, i.e. each analyzer may receive up to the limit, NOT this in
 *    total); and the whole-category row is the exact sum across every pair in
 *    both directions.
 *
 *  - Every other category (the result, etc.) is NOT a per-connection quantity;
 *    its configured value is used directly as the limit.
 */
export function applyExpectedLimits(
    displayed: CommunicationMeasurement[],
    config: ExpectedConfig,
) : CommunicationMeasurement[] {
    return displayed.map((m) => {
        if (m.category === CommunicationCategory.NODE_TO_NODE) {
            const pairsByDirection : Record<string, Set<string>> = {};

            for (const e of m.events) {
                const dir = e.direction;
                const { pair } = e;

                if (!dir || !pair) {
                    continue;
                }

                (pairsByDirection[dir] = pairsByDirection[dir] || new Set()).add(pair);
            }

            let count = 0;
            let bytes = 0;
            let hasCount = false;
            let hasBytes = false;

            for (const [dir, pairs] of Object.entries(pairsByDirection)) {
                const perPair = config.perPairByDirection[dir];

                if (!perPair) {
                    continue;
                }

                const nPairs = pairs.size;

                if (perPair.count !== undefined) {
                    count += perPair.count * nPairs; hasCount = true; 
                }

                if (perPair.bytes !== undefined) {
                    bytes += perPair.bytes * nPairs; hasBytes = true; 
                }
            }

            return {
                ...m,
                expectedCount: hasCount ? count : m.expectedCount,
                expectedBytes: hasBytes ? bytes : m.expectedBytes,
            };
        }

        const general = config.generalByCategory[m.category];

        if (!general) {
            return m;
        }

        return {
            ...m,
            expectedCount: general.count !== undefined ? general.count : m.expectedCount,
            expectedBytes: general.bytes !== undefined ? general.bytes : m.expectedBytes,
        };
    });
}

export function formatBytes(input: number | null | undefined) : string {
    if (!input) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = input;
    let index = 0;

    while (value >= 1024 && index < units.length - 1) {
        value /= 1024;
        index++;
    }

    return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function measurementTotals(measurement: CommunicationMeasurement) : { count: number, bytes: number } {
    return {
        count: measurement.events.length,
        bytes: measurement.events.reduce((acc, event) => acc + (event.bytes || 0), 0),
    };
}

// ---------------------------------------------------------------------------
// Boundary model: data is
// safest at the node and grows riskier as it crosses outward — to peer nodes,
// to the central hub, and finally out to an external consumer. Categories map
// to boundary levels, and the colour scale runs cool (safe) -> warm (risk).

export enum CommunicationBoundary {
    LOCAL = 'local', // stays at the node
    PEER = 'peer', // crosses to another node
    HUB = 'hub', // reaches the central hub
    EXTERNAL = 'external', // leaves the federation entirely
}

export const COMMUNICATION_BOUNDARY_META : Record<CommunicationBoundary, {
    label: string, 
    color: string, 
    rank: number 
}> = {
    [CommunicationBoundary.LOCAL]: {
        label: 'At node', 
        color: 'var(--privateaim-brand-blue, #4d7fff)', 
        rank: 0, 
    },
    [CommunicationBoundary.PEER]: {
        label: 'Peer node', 
        color: 'var(--privateaim-brand-teal, #2bb6a8)', 
        rank: 1, 
    },
    [CommunicationBoundary.HUB]: {
        label: 'Hub', 
        color: 'var(--privateaim-brand-rust, #c2562f)', 
        rank: 2, 
    },
    [CommunicationBoundary.EXTERNAL]: {
        label: 'Result', 
        color: 'var(--privateaim-brand-coral, #ff6f61)', 
        rank: 3, 
    },
};

export function categoryBoundary(category: CommunicationCategory) : CommunicationBoundary {
    switch (category) {
        case CommunicationCategory.INPUT_DATA: return CommunicationBoundary.LOCAL;
        case CommunicationCategory.NODE_TO_NODE: return CommunicationBoundary.PEER;
        case CommunicationCategory.NODE_TO_HUB: return CommunicationBoundary.HUB;
        case CommunicationCategory.RESULT_DATA: return CommunicationBoundary.EXTERNAL;
        default: return CommunicationBoundary.HUB;
    }
}

// ---------------------------------------------------------------------------
// Re-project base (category-level) measurements to a chosen detail level.
// 'direction' / 'pair' split each category by the matching event field; a
// category whose events lack that field is left whole (e.g. Input-Data).

export function projectByDetail(
    base: CommunicationMeasurement[],
    detail: CommunicationDetail,
) : CommunicationMeasurement[] {
    if (detail === 'category') {
        return base;
    }

    const dimension = detail;
    const out : CommunicationMeasurement[] = [];

    for (const m of base) {
        const splittable = m.events.some((e) => (e as any)[dimension]);

        if (!splittable) {
            out.push(m);

            continue;
        }

        const groups = Object.groupBy(m.events, (e) => `${(e as any)[dimension] || 'other'}`);
        const sorted = Object.entries(groups).sort(([a], [b]) => (a < b ? -1 : 1));

        sorted.forEach(([gv, events], index) => {
            if (!events || events.length === 0) {
                return;
            }

            // colour unchanged (series palette); direction adds a dash pattern.
            out.push({
                category: m.category,
                key: `${m.category}:${gv}`,
                color: seriesColor(gv, index),
                dash: dimension === 'direction' ? directionDash(gv) :
                    directionDash((events[0] as any).direction),
                title: gv,
                unit: m.unit,
                source: m.source,
                events,
            });
        });
    }

    return out;
}

/** endpoints (from -> to) for a measurement, for flow diagrams */
export function measurementEndpoints(m: CommunicationMeasurement) : { from: string, to: string } {
    if (m.title && m.title.includes('\u2192')) {
        const [from, to] = m.title.split('\u2192').map((s) => s.trim());

        return { from: from || '?', to: to || '?' };
    }

    switch (m.category) {
        case CommunicationCategory.NODE_TO_NODE: return { from: 'Node', to: 'Node (peer)' };
        case CommunicationCategory.NODE_TO_HUB: return { from: 'Source', to: 'Hub' };
        case CommunicationCategory.RESULT_DATA: return { from: 'Node', to: 'Result' };
        default: return { from: '?', to: '?' };
    }
}
