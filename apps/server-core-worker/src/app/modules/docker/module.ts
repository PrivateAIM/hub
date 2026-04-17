/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { createClient } from 'docken';
import { DockerInjectionKey } from './constants.ts';

export class DockerModule implements IModule {
    readonly name = 'docker';

    readonly dependencies: string[] = [];

    async setup(container: IContainer): Promise<void> {
        const client = createClient();

        container.register(DockerInjectionKey, { useValue: client });
    }
}
