/*
 * Derivation tests against a real dev-environment dump (analysis with two
 * analyzers and one aggregator): raw FLAME data in → measurements out.
 * The expected numbers are computed from the fixture itself, so the test
 * pins the derivation semantics, not the particular dump.
 */
import { readFileSync } from 'node:fs';
import {
    describe,
    expect,
    it,
} from 'vitest';
import {
    CommunicationCategory,
    deriveMeasurements,
    parseLogTime,
} from '../../src';

const fixture = JSON.parse(
    readFileSync(new URL('../fixtures/analysis-dump.json', import.meta.url), 'utf8'),
);

// the dump keys node logs by node NAME; the derivation expects node_id
const nodes = fixture.analysis_nodes.data;
const logs : Record<string, any[]> = {};
for (const key of Object.keys(fixture.analysis_node_logs)) {
    const node = nodes.find((n: any) => n.node?.name === key);
    logs[node.node_id] = fixture.analysis_node_logs[key].data;
}
const filesByType : Record<string, any[]> = {};
for (const key of Object.keys(fixture.bucket_files)) {
    filesByType[key] = fixture.bucket_files[key].data;
}

const measurements = deriveMeasurements({
    nodes, 
    logs, 
    filesByType, 
});
const byCategory = Object.fromEntries(measurements.map((m) => [m.category, m]));

describe('deriveMeasurements (fixture)', () => {
    it('derives one node-to-node event per "received message from" log line', () => {
        const expected = Object.values(logs).flat()
            .filter((l) => /received message from [0-9a-f-]{36}/i.test(l.message || ''))
            .length;
        expect(expected).toBeGreaterThan(0);
        expect(byCategory[CommunicationCategory.NODE_TO_NODE].events).toHaveLength(expected);
    });

    it('attributes every TEMP payload byte to node-to-node', () => {
        const expectedBytes = filesByType.TEMP.reduce((acc, f) => acc + (f.size || 0), 0);
        const actualBytes = byCategory[CommunicationCategory.NODE_TO_NODE].events
            .reduce((acc, e) => acc + (e.bytes || 0), 0);
        expect(actualBytes).toBe(expectedBytes);
    });

    it('tags events with role direction and named node pairs', () => {
        const { events } = byCategory[CommunicationCategory.NODE_TO_NODE];
        for (const event of events) {
            expect(event.direction).toMatch(/^(analyzer|aggregator) → (analyzer|aggregator|\?)$/);
            expect(event.pair).toContain('(');
        }
        // fixture topology: analyzers report to the aggregator and back
        const directions = new Set(events.map((e) => e.direction));
        expect(directions.has('analyzer → aggregator')).toBe(true);
    });

    it('derives one result event per RESULT file with its size', () => {
        const { events } = byCategory[CommunicationCategory.RESULT_DATA];
        expect(events).toHaveLength(filesByType.RESULT.length);
        expect(events.reduce((acc, e) => acc + (e.bytes || 0), 0))
            .toBe(filesByType.RESULT.reduce((acc, f) => acc + (f.size || 0), 0));
    });

    it('excludes CODE files entirely and reports input-data as unavailable', () => {
        const allEvents = measurements.flatMap((m) => m.events);
        expect(allEvents.length).toBeGreaterThan(0);
        // no measurement carries as many extra events as the CODE upload would add
        expect(measurements.some((m) => (m as any).category === 'node_to_hub')).toBe(false);
        expect(byCategory[CommunicationCategory.INPUT_DATA].unavailable).toBe(true);
        expect(byCategory[CommunicationCategory.INPUT_DATA].events).toHaveLength(0);
    });
});

describe('parseLogTime', () => {
    it('parses the formats a hub can deliver', () => {
        const ms = Date.UTC(2026, 5, 12, 8, 24, 10);
        expect(parseLogTime('2026-06-12T08:24:10.000Z')).toBe(ms);
        expect(parseLogTime(`${ms * 1000}`)).toBe(ms); // microseconds
        expect(parseLogTime(`${ms}`)).toBe(ms); // milliseconds
        expect(parseLogTime(`${Math.floor(ms / 1000)}`)).toBe(ms); // seconds
        expect(parseLogTime('not a time')).toBeNull();
    });
});
