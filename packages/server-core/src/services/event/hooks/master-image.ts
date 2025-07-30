/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasOwnProperty, isObject } from '@privateaim/kit';
import type { MasterImagesEventContext } from '@privateaim/server-analysis-manager-kit';
import { MasterImagesEvent } from '@privateaim/server-analysis-manager-kit';
import type { EventEntity } from '../../../database';
import type { EventServiceHook } from '../types';

export class EventServiceMasterImageHook implements EventServiceHook {
    async pre(input: EventEntity): Promise<void> {
        if (
            isObject(input.data) &&
            hasOwnProperty(input.data, 'id') &&
            typeof input.data.id === 'string'
        ) {
            input.ref_id = input.data.id;
        }

        input.data = this.buildData(input.data as MasterImagesEventContext);
    }

    async post(): Promise<void> {
        // todo: save to master image repository
    }

    protected buildData(input: MasterImagesEventContext) {
        if (
            input.event === MasterImagesEvent.BUILD_FAILED ||
            input.event === MasterImagesEvent.PUSH_FAILED ||
            input.event === MasterImagesEvent.SYNCHRONIZATION_FAILED
        ) {
            return {
                error: input.data.error,
            };
        }

        if (
            input.event === MasterImagesEvent.BUILT ||
            input.event === MasterImagesEvent.PUSHING ||
            input.event === MasterImagesEvent.PUSHED
        ) {
            return {
                tags: input.data.tags,
            };
        }

        return undefined;
    }
}
