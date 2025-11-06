/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucketType } from '@privateaim/core-kit';
import type { AnalysisCoreCommand, AnalysisCoreEvent } from './constants';

export type AnalysisCoreBasePayload = {
    error?: Error
};

export type AnalysisCoreConfigurePayload = AnalysisCoreBasePayload & {
    id: string
};

export type AnalysisCoreDestroyPayload = AnalysisCoreBasePayload & {
    id: string
};

export type CoreConfigureCommandContext = {
    command: `${AnalysisCoreCommand.CONFIGURE}`,
    data: AnalysisCoreConfigurePayload,
};

export type CoreDestroyCommandContext = {
    command: `${AnalysisCoreCommand.DESTROY}`,
    data: AnalysisCoreDestroyPayload
};

export type CoreConfigureEventContext = CoreConfigureCommandContext & {
    event: `${AnalysisCoreEvent.FAILED}` |
        `${AnalysisCoreEvent.CONFIGURED}` |
        `${AnalysisCoreEvent.CONFIGURING}`;
};

export type CoreDestroyEventContext = CoreDestroyCommandContext & {
    event: `${AnalysisCoreEvent.FAILED}` |
        `${AnalysisCoreEvent.DESTROYED}` |
        `${AnalysisCoreEvent.DESTROYING}` |
        `${AnalysisCoreEvent.NONE}`;
};

export type CoreBucketEventPayload = {
    id: string,
    bucketType: `${AnalysisBucketType}`,
    bucketId: string
};

export type CoreBucketCreatedEventContext = {
    event: `${AnalysisCoreEvent.BUCKET_CREATED}`,
    data: CoreBucketEventPayload
};

export type CoreBucketDeletedEventContext = {
    event: `${AnalysisCoreEvent.BUCKET_DELETED}`,
    data: CoreBucketEventPayload
};

export type CoreCommandContext = CoreDestroyCommandContext | CoreConfigureCommandContext;
export type CoreEventContext = CoreDestroyEventContext |
CoreConfigureEventContext |
CoreBucketCreatedEventContext |
CoreBucketDeletedEventContext;
