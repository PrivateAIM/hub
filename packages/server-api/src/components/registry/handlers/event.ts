/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { useLogger } from '../../../config';
import { RegistryHookEvent } from '../constants';
import type { RegistryEventPayload } from '../type';

export async function dispatchRegistryEventToTrainManager(
    data: RegistryEventPayload,
) {
    // only process terminated trains and the PUSH_ARTIFACT event
    switch (data.event) {
        case RegistryHookEvent.DELETE_ARTIFACT:
        case RegistryHookEvent.PULL_ARTIFACT:
        case RegistryHookEvent.QUOTA_EXCEED:
        case RegistryHookEvent.QUOTA_WARNING:
        case RegistryHookEvent.SCANNING_COMPLETED:
        case RegistryHookEvent.SCANNING_FAILED: {
            useLogger()
                .info(`skipping registry event: ${data.event}`);
            break;
        }
    }
}
