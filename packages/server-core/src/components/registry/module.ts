/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BaseComponent } from '@privateaim/server-kit';
import { RegistryCommand } from './constants';
import {
    RegistryCleanupHandler,
    RegistryHookHandler,
    RegistryProjectLinkHandler,
    RegistryProjectRelinkHandler,
    RegistryProjectUnlinkHandler,
    RegistrySetupHandler,
} from './handlers';
import type { RegistryEventMap } from './type';

export class RegistryComponent extends BaseComponent<RegistryEventMap> {
    constructor() {
        super();

        this.mount(RegistryCommand.SETUP, new RegistrySetupHandler());
        this.mount(RegistryCommand.CLEANUP, new RegistryCleanupHandler());

        this.mount(RegistryCommand.HOOK_PROCESS, new RegistryHookHandler());

        this.mount(RegistryCommand.PROJECT_LINK, new RegistryProjectLinkHandler());
        this.mount(RegistryCommand.PROJECT_UNLINK, new RegistryProjectUnlinkHandler());
        this.mount(RegistryCommand.PROJECT_RELINK, new RegistryProjectRelinkHandler());
    }

    async start() {
        await this.initialize();
    }
}
