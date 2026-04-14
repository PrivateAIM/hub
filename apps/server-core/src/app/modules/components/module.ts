/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { createConfig } from '../config/components.ts';

export class ComponentsModule implements IModule {
    readonly name = 'components';

    readonly dependencies: string[] = ['database'];

    async setup(container: IContainer): Promise<void> { // eslint-disable-line @typescript-eslint/no-unused-vars
        const config = createConfig();
        config.components.forEach((c) => c.start());
        config.aggregators.forEach((a) => a.start());
    }
}
