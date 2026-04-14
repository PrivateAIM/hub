/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    MasterImageSynchronizerExecutionFinishedPayload,
} from '@privateaim/server-core-worker-kit';
import { useLogger } from '@privateaim/server-kit';
import { MasterImageSynchronizerService } from '../../../../core/services/master-image/index.ts';

export async function handleMasterImageSynchronizerExecutionFinishedEvent(value: MasterImageSynchronizerExecutionFinishedPayload) {
    const synchronizer = new MasterImageSynchronizerService();

    const output = await synchronizer
        .sync(value);

    useLogger().info(`Created ${output.images.created.length} master images.`);
    useLogger().info(`Deleted ${output.images.deleted.length} master images.`);
    useLogger().info(`Updated ${output.images.updated.length} master images.`);
}
