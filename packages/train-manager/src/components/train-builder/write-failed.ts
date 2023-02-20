/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { publish } from 'amqp-extension';
import {
    TrainManagerBuilderEvent, TrainManagerComponent,
} from '@personalhealthtrain/central-common';
import type { QueueEventErrorContext } from '../type';
import { BuilderError } from './error';
import { buildEventQueueMessageForAPI } from '../../config';
import { BaseError } from '../error';

export async function writeFailedEvent(
    data: Record<string, any>,
    context: QueueEventErrorContext,
) {
    const buildingError = context.error instanceof BuilderError ||
        context.error instanceof BaseError ?
        context.error :
        new BuilderError({ previous: context.error });

    await publish(buildEventQueueMessageForAPI({
        event: TrainManagerBuilderEvent.FAILED,
        component: TrainManagerComponent.BUILDER,
        command: context.command,
        data: {
            ...data,
            error: {
                code: buildingError.getCode(),
                message: buildingError.message,
                step: buildingError.getStep(),
            },
        },
    }));
}
