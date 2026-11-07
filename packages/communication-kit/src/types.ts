/*
 * Shared types of the communication measurement model and derivation.
 */
import type { AnalysisNode } from '@privateaim/core-kit';
import type { BucketFile } from '@privateaim/storage-kit';
import type { Log } from '@privateaim/telemetry-kit';
import type { CommunicationCategory } from './model';

export type CommunicationMeasurementUnit = 'bytes' | 'count' | 'scalar';

/**
 * A single observation at a point in time.
 */
export type CommunicationEvent = {
    /** epoch milliseconds */
    time: number;
    /** size in bytes, if this event moved data */
    bytes?: number;
    /** free-form short label (e.g. endpoint path, file name, message kind) */
    label?: string;
    /** optional sub-grouping within a category (e.g. "node1 → node4") */
    series?: string;
    /** role-level direction, e.g. "analyzer → aggregator" */
    direction?: string;
    /** specific node pair, e.g. "node1 → node4" */
    pair?: string;
    /** the raw source record, for drill-down / tooltips */
    raw?: unknown;
};

/**
 * All observations belonging to one category, plus optional expectation.
 */
export type CommunicationMeasurement = {
    category: CommunicationCategory;
    /** unique identifier; defaults to category when omitted (needed when several
     *  measurements share a category, e.g. one per node pair) */
    key?: string;
    /** explicit colour for dynamic groups not covered by category meta */
    color?: string;
    /** SVG stroke-dasharray for line style (encodes direction); undefined = solid */
    dash?: string;
    /** human label, e.g. "Node-to-Node" */
    title: string;
    /** short explanation shown under the title */
    description?: string;
    unit: CommunicationMeasurementUnit;
    events: CommunicationEvent[];

    /** expected number of events (for expected-vs-actual) */
    expectedCount?: number;
    /** expected total volume in bytes */
    expectedBytes?: number;

    /** true when the data for this category is not yet obtainable */
    unavailable?: boolean;
    /** shown when unavailable, explains why */
    unavailableReason?: string;

    /** where the data came from, for provenance labelling */
    source?: 'hub' | 'sdk' | 'self_reported';
};

/** Expected values (count and/or volume) for one slice of communication. */
export type ExpectedValues = {
    count?: number;
    bytes?: number;
};

/** Expected-value configuration: per-node-pair by node-to-node direction, plus a
 *  direct (non per-connection) expected for every other category (e.g. result). */
export type ExpectedConfig = {
    perPairByDirection: Record<string, ExpectedValues>;
    generalByCategory: Partial<Record<CommunicationCategory, ExpectedValues>>;
};

export type CommunicationDetail = 'category' | 'direction' | 'pair';

export type CommunicationRawData = {
    nodes: AnalysisNode[];
    logs: Record<string, Log[]>;
    filesByType: Record<string, BucketFile[]>;
};
