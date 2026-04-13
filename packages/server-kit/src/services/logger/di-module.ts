/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { ModuleName } from '../module-names';
import { LoggerInjectionKey } from './constants';
import { createLogger } from './module';
import { setLoggerFactory } from './singleton';
import type { LoggerCreateContext } from './types';

export type LoggerModuleOptions = LoggerCreateContext;

export class LoggerModule implements IModule {
    readonly name = ModuleName.LOGGER;

    readonly dependencies: string[] = [];

    private options: LoggerModuleOptions;

    constructor(options: LoggerModuleOptions = {}) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        const logger = createLogger(this.options);
        container.register(LoggerInjectionKey, { useValue: logger });

        // Bridge: back-fill singa singleton so libraries still calling useLogger() work
        setLoggerFactory(() => logger);
    }
}
