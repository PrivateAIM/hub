/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { DataSource } from 'typeorm';
import { MessageRepositoryAdapter } from './repositories/message/repository.ts';
import { DatabaseInjectionKey } from './constants.ts';

export function registerRepositories(container: IContainer, dataSource: DataSource): void {
    container.register(DatabaseInjectionKey.MessageRepository, { useValue: new MessageRepositoryAdapter(dataSource) });
}
