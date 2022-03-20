import { ConsumeHandlers, Message } from 'amqp-extension';
import { TrainManagerQueueCommand } from '@personalhealthtrain/central-common';
import { useLogger } from '../../modules/log';
import { processEvent } from './process';
import { writeProcessedEvent } from './write-processed';
import { writeProcessingEvent } from './write-processing';
import { writeFailedEvent } from './write-failed';
import { writeDownloadingEvent } from './write-downloading';
import { downloadImage } from './download';
import { writeDownloadedEvent } from './write-downloaded';
import { ExtractingError } from './error';
import { processExtractingStatusEvent } from './status';

export function createExtractingComponentHandlers() : ConsumeHandlers {
    return {
        [TrainManagerQueueCommand.EXTRACT]: async (message: Message) => {
            useLogger().debug('process event received', {
                component: 'image-extracting',
            });

            await Promise.resolve(message)
                .then(writeDownloadingEvent)
                .then(downloadImage)
                .then(writeDownloadedEvent)
                .then(writeProcessingEvent)
                .then(processEvent)
                .then(writeProcessedEvent)
                .catch((err: ExtractingError) => writeFailedEvent(message, err));
        },
        [TrainManagerQueueCommand.EXTRACT_STATUS]: async (message: Message) => {
            useLogger().debug('status event received', {
                component: 'image-extracting',
            });

            await Promise.resolve(message)
                .then(processExtractingStatusEvent)
                .catch((err) => writeFailedEvent(message, err));
        },
    };
}
