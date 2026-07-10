/*
 * Pure measurement derivation (adapter) for an analysis' communication.
 *
 * Raw FLAME data in (analysis nodes, per-node logs, bucket files by type) →
 * categorized, directionality-tagged base measurements out. No fetching, no
 * framework imports — the client dashboard wraps this in a computed, and the
 * server-side communication-summary endpoint calls it directly.
 */
import type { AnalysisNode } from '@privateaim/core-kit';
import type { BucketFile } from '@privateaim/storage-kit';
import type { Log } from '@privateaim/telemetry-kit';
import type { CommunicationEvent, CommunicationMeasurement } from './model';
import { CommunicationCategory } from './model';

const PAYLOAD_MATCH_WINDOW_MS = 120 * 1000;

/**
 * Live hubs return ISO time strings; the Log entity documents microseconds.
 * Normalise both (plus ms/seconds) to ms since epoch; null when unparseable.
 */
export function parseLogTime(input: string | bigint) : number | null {
    const raw = `${input}`;
    if (/^\d+$/.test(raw)) {
        const value = Number(raw);
        if (raw.length >= 16) return Math.floor(value / 1000); // µs
        if (raw.length >= 13) return value; // ms
        return value * 1000; // s
    }
    const parsed = Date.parse(raw);
    return Number.isNaN(parsed) ? null : parsed;
}

export interface CommunicationRawData {
    nodes: AnalysisNode[];
    logs: Record<string, Log[]>;
    filesByType: Record<string, BucketFile[]>;
}

export function deriveMeasurements(raw: CommunicationRawData) : CommunicationMeasurement[] {
    const nodeName = (id: string) => {
        const item = raw.nodes.find((n) => n.node_id === id);
        return item?.node?.name || `${id.substring(0, 8)}…`;
    };
    const nodeRole = (id: string) => {
        const item = raw.nodes.find((n) => n.node_id === id);
        return item?.node?.type === 'aggregator' ? 'aggregator' : 'analyzer';
    };
    // "name (role)" for node-pair labels, e.g. "node1 (analyzer)"
    const nodeLabel = (id: string) => `${nodeName(id)} (${nodeRole(id)})`;

    const actorToNode : Record<string, string> = {};
    for (const item of raw.nodes) {
        if (item.node?.client_id) actorToNode[item.node.client_id] = item.node_id;
        if (item.node?.robot_id) actorToNode[item.node.robot_id] = item.node_id;
    }

    // -- node-to-node: "received message from <uuid>" log lines carry the
    //    connection; TEMP bucket files carry the payload sizes.
    const events : (CommunicationEvent & { senderId: string })[] = [];
    for (const item of raw.nodes) {
        const receiverId = item.node_id;
        for (const log of (raw.logs[receiverId] || [])) {
            const match = /received message from ([0-9a-f-]{36})/i.exec(log.message || '');
            if (!match) continue;
            const senderId = match[1];
            events.push({
                senderId,
                time: parseLogTime(log.time) ?? 0,
                bytes: 0,
                direction: `${nodeRole(senderId)} → ${nodeRole(receiverId)}`,
                pair: `${nodeLabel(senderId)} → ${nodeLabel(receiverId)}`,
                label: `${nodeName(senderId)} → ${nodeName(receiverId)}`,
            });
        }
    }

    const temp = raw.filesByType.TEMP || [];
    for (const file of temp) {
        const senderNodeId = file.actor_id ? actorToNode[file.actor_id] : undefined;
        if (!senderNodeId) continue;
        const created = new Date(`${file.created_at}`).getTime();

        let best : (CommunicationEvent & { senderId: string }) | undefined;
        let bestDist = Infinity;
        for (const ev of events) {
            if (ev.senderId !== senderNodeId) continue;
            if ((ev.bytes || 0) > 0) continue;
            const dist = Math.abs(ev.time - created);
            if (dist <= PAYLOAD_MATCH_WINDOW_MS && dist < bestDist) {
                best = ev;
                bestDist = dist;
            }
        }
        if (best) {
            best.bytes = file.size || 0;
        } else {
            events.push({
                senderId: senderNodeId,
                time: created,
                bytes: file.size || 0,
                direction: `${nodeRole(senderNodeId)} → ?`,
                pair: `${nodeLabel(senderNodeId)} → ?`,
                label: `${nodeName(senderNodeId)} payload`,
            });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const nodeToNodeEvents = events.map(({ senderId, ...e }) => e);

    // -- result: the result file written to the hub. Downloads are not counted
    //    here — a download retrieves the same bytes (not new data movement) and
    //    the recipient is not recorded; the retrieval count is on the Result
    //    Data card. (Analysis code is not represented at all: distributing the
    //    program is infrastructure, not part of the analysis's data movement.)
    const senderRoleLabel = (actorId: string | null | undefined, fallback: string) => {
        const nodeId = actorId ? actorToNode[actorId] : undefined;
        return nodeId ? nodeRole(nodeId) : fallback;
    };
    // "name (role)" when the uploader resolves to a node, else the fallback
    const senderLabel = (actorId: string | null | undefined, fallback: string) => {
        const nodeId = actorId ? actorToNode[actorId] : undefined;
        return nodeId ? nodeLabel(nodeId) : fallback;
    };

    const result = raw.filesByType.RESULT || [];
    const resultEvents : CommunicationEvent[] = result.map((f) => ({
        time: new Date(`${f.created_at}`).getTime(),
        bytes: f.size || 0,
        label: `${f.name} written`,
        direction: `${senderRoleLabel(f.actor_id, 'node')} → result`,
        pair: `${senderLabel(f.actor_id, 'Node')} → Result`,
    }));

    return [
        {
            category: CommunicationCategory.NODE_TO_NODE,
            title: 'Node-to-Node',
            description: 'Intermediate data exchanged between nodes. End-to-end encrypted (AES-256-GCM via ECDH) before upload, so the hub stores only ciphertext addressed to the recipient node.',
            unit: 'bytes',
            source: 'hub',
            events: nodeToNodeEvents,
        },
        {
            category: CommunicationCategory.RESULT_DATA,
            title: 'Result',
            description: 'Final result written to the hub and any retrievals of it.',
            unit: 'bytes',
            source: 'hub',
            events: resultEvents,
        },
        {
            category: CommunicationCategory.INPUT_DATA,
            title: 'Input-Data',
            description: 'Queries against the local data sources at each node.',
            unit: 'count',
            source: 'hub',
            events: [],
            unavailable: true,
            unavailableReason: 'Recorded at the nodes, not reported to the hub.',
        },
    ];
}
