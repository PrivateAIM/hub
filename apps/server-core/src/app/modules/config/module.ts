/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { ConfigInjectionKey } from './constants.ts';
import { normalizeConfig } from './normalize.ts';
import { readConfigFromEnv } from './read.ts';
import type { Config } from './types.ts';

export class ConfigModule implements IModule {
    readonly name = 'config';

    readonly dependencies: string[] = [];

    private readonly instance?: Config;

    constructor(instance?: Config) {
        this.instance = instance;
    }

    async setup(container: IContainer): Promise<void> {
        const config = this.instance ?? this.read();
        container.register(ConfigInjectionKey, { useValue: config });
    }

    private read(): Config {
        const raw = readConfigFromEnv();
        return normalizeConfig(raw);
    }
}
