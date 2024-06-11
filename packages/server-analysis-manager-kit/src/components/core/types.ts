/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucketType } from '@privateaim/core';
import type { CoreCommand, CoreEvent } from './constants';

export type CoreBasePayload = {
    error?: Error
};

export type CoreConfigurePayload = CoreBasePayload & {
    id: string
};

export type CoreDestroyPayload = CoreBasePayload & {
    id: string
};

export type CoreConfigureCommandContext = {
    command: `${CoreCommand.CONFIGURE}`,
    data: CoreConfigurePayload,
};

export type CoreDestroyCommandContext = {
    command: `${CoreCommand.DESTROY}`,
    data: CoreDestroyPayload
};

export type CoreConfigureEventContext = CoreConfigureCommandContext & {
    event: `${CoreEvent.FAILED}` |
        `${CoreEvent.CONFIGURED}` |
        `${CoreEvent.CONFIGURING}`;
};

export type CoreDestroyEventContext = CoreDestroyCommandContext & {
    event: `${CoreEvent.FAILED}` |
        `${CoreEvent.DESTROYED}` |
        `${CoreEvent.DESTROYING}` |
        `${CoreEvent.NONE}`;
};

export type CoreBucketEventPayload = {
    id: string,
    bucketType: `${AnalysisBucketType}`,
    bucketId: string
};

export type CoreBucketCreatedEventContext = {
    event: `${CoreEvent.BUCKET_CREATED}`,
    data: CoreBucketEventPayload
};

export type CoreBucketDeletedEventContext = {
    event: `${CoreEvent.BUCKET_DELETED}`,
    data: CoreBucketEventPayload
};

export type CoreCommandContext = CoreDestroyCommandContext | CoreConfigureCommandContext;
export type CoreEventContext = CoreDestroyEventContext |
CoreConfigureEventContext |
CoreBucketCreatedEventContext |
CoreBucketDeletedEventContext;
