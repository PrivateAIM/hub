/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';
import type { INodeRepository } from '../../../core/index.ts';
import type { NodeClientService } from '../database/node-client.ts';

export type NodeClientPermissionSyncContext = {
    repository: INodeRepository,
    nodeClientService: Pick<NodeClientService, 'assignPermissions'>,
    logger?: Logger,
};

export type NodeClientPermissionSyncResult = {
    synced: number,
    failed: number,
};
