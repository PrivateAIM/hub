/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteralKeys } from '@privateaim/kit';
import type { ComponentMetadata } from '@privateaim/server-kit';
import type { BucketCommand, BucketEvent } from './constants';
import type {
    BucketCreateCommandPayload,
    BucketCreationFailedEventPayload, BucketCreationFinishedEventPayload,
    BucketDeleteCommandPayload, BucketDeletionFailedEventPayload, BucketDeletionFinishedEventPayload,
} from './handlers';

export type BucketComponentEventMap = ObjectLiteralKeys<{
    [BucketCommand.CREATE]: [BucketCreateCommandPayload, ComponentMetadata],
    [BucketCommand.DELETE]: [BucketDeleteCommandPayload, ComponentMetadata],

    [BucketEvent.CREATION_FAILED]: [BucketCreationFailedEventPayload, ComponentMetadata],
    [BucketEvent.CREATION_STARTED]: [BucketCreateCommandPayload, ComponentMetadata],
    [BucketEvent.CREATION_FINISHED]: [BucketCreationFinishedEventPayload, ComponentMetadata],

    [BucketEvent.DELETION_FAILED]: [BucketDeletionFailedEventPayload, ComponentMetadata],
    [BucketEvent.DELETION_STARTED]: [BucketDeleteCommandPayload, ComponentMetadata],
    [BucketEvent.DELETION_FINISHED]: [BucketDeletionFinishedEventPayload, ComponentMetadata],
}>;
