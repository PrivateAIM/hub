/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { useEnv } from '../../../config/env/index.ts';
import { ConfigInjectionKey } from './constants.ts';

export class ConfigModule implements IModule {
    readonly name = 'config';

    readonly dependencies: string[] = [];

    async setup(container: IContainer): Promise<void> {
        const config = useEnv();
        container.register(ConfigInjectionKey, { useValue: config });
    }
}
