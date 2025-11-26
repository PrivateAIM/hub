/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteralKeys } from '@privateaim/kit';
import type { ComponentMetadata } from '@privateaim/server-kit';
import type { BucketFileCommand, BucketFileEvent } from './constants';
import type {
    BucketFileCreateCommandPayload,
    BucketFileCreationFailedEventPayload,
    BucketFileCreationFinishedEventPayload,
    BucketFileCreationStartedEventPayload,
    BucketFileDeleteCommandPayload,
    BucketFileDeletionFailedEventPayload,
    BucketFileDeletionFinishedEventPayload,
} from './handlers';

export type BucketFileComponentEventMap = ObjectLiteralKeys<{
    [BucketFileCommand.CREATE]: [BucketFileCreateCommandPayload, ComponentMetadata],
    [BucketFileCommand.DELETE]: [BucketFileDeleteCommandPayload, ComponentMetadata],

    [BucketFileEvent.CREATION_FAILED]: [BucketFileCreationFailedEventPayload, ComponentMetadata],
    [BucketFileEvent.CREATION_STARTED]: [BucketFileCreationStartedEventPayload, ComponentMetadata],
    [BucketFileEvent.CREATION_FINISHED]: [BucketFileCreationFinishedEventPayload, ComponentMetadata],

    [BucketFileEvent.DELETION_FAILED]: [BucketFileDeletionFailedEventPayload, ComponentMetadata],
    [BucketFileEvent.DELETION_STARTED]: [BucketFileDeleteCommandPayload, ComponentMetadata],
    [BucketFileEvent.DELETION_FINISHED]: [BucketFileDeletionFinishedEventPayload, ComponentMetadata],
}>;
