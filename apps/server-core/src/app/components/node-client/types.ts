/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Component, Logger } from '@privateaim/server-kit';
import type { INodeRepository } from '../../../core/index.ts';
import type { NodeClientService } from '../../modules/database/node-client.ts';

export type NodeClientPermissionSyncContext = {
    repository: INodeRepository,
    nodeClientService: Pick<NodeClientService, 'assignPermissions'>,
    logger?: Logger,
};

export type NodeClientPermissionSyncResult = {
    synced: number,
    failed: number,
};

export type NodeClientComponentContext = NodeClientPermissionSyncContext & {
    /**
     * Runs a pass exclusively across replicas (a database lock in production).
     */
    lock: <T>(fn: () => Promise<T>) => Promise<T>,
};

export type NodeClientComponent = Component & {
    start: () => Promise<void>,
    stop: () => Promise<void>,
    /**
     * Epoch millis of the last pass that completed without an error, and of
     * the start of the pass in flight; each undefined while there is none.
     */
    status: () => { lastSuccessAt?: number, runningSince?: number },
};
