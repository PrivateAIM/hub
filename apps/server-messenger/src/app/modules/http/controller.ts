/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import { MessageController } from '../../../adapters/http/controllers/message/index.ts';
import { MessageService } from '../../../core/entities/message/index.ts';
import { DatabaseInjectionKey } from '../database/constants.ts';
import { WakeupInjectionKey } from '../wakeup/constants.ts';

export function createControllers(container: IContainer): Record<string, any>[] {
    const messageRepository = container.resolve(DatabaseInjectionKey.MessageRepository);
    const wakeup = container.resolve(WakeupInjectionKey);

    const messageService = new MessageService({ repository: messageRepository, wakeup });

    return [
        new MessageController({ service: messageService, wakeup }),
    ];
}
