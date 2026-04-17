/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { ModuleName } from '../module-names';
import { AmqpClientInjectionKey } from './constants';
import { AmqpClient } from './module';

export type AmqpModuleOptions = {
    connectionString?: string;
};

export class AmqpModule implements IModule {
    readonly name = ModuleName.AMQP;

    readonly dependencies: string[] = [];

    private options: AmqpModuleOptions;

    constructor(options: AmqpModuleOptions = {}) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        if (!this.options.connectionString) {
            return;
        }

        const client = new AmqpClient({ connectionOptions: this.options.connectionString });
        container.register(AmqpClientInjectionKey, { useValue: client });
    }
}
