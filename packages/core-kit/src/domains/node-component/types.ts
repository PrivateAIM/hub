/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node } from '../node';
import type { NodeComponentStatus } from './constants';

export type NodeComponent = {
    id: string;
    nodeId: Node['id'];
    name: string;
    version: string | null;
    status: `${NodeComponentStatus}`;
    message: string | null;
    latency: number | null;
    uptime: number | null;
    checksTotal: number | null;
    checksSuccessful: number | null;
    reportedAt: string;
    createdAt: string;
    updatedAt: string;
    node?: Node;
};

export type NodeComponentReport = {
    name: string;
    status: `${NodeComponentStatus}`;
    version?: string | null;
    message?: string | null;
    latency?: number | null;
    uptime?: number | null;
    checksTotal?: number | null;
    checksSuccessful?: number | null;
};

export type NodeComponentsReport = {
    deployment?: { name: string; version: string };
    components: NodeComponentReport[];
};
