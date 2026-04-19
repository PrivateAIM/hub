/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { LOGGER_MODULE_NAME, LoggerInjectionKey } from './constants';
import { createLogger } from './module';
import type { LoggerCreateContext } from './types';

export type LoggerModuleOptions = LoggerCreateContext;

export class LoggerModule implements IModule {
    readonly name = LOGGER_MODULE_NAME;

    readonly dependencies: string[] = [];

    private options: LoggerModuleOptions;

    constructor(options: LoggerModuleOptions = {}) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        const logger = createLogger(this.options);
        container.register(LoggerInjectionKey, { useValue: logger });
    }
}
