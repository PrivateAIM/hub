/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ComponentHandlers } from '@privateaim/server-kit';
import { EventCommand } from '../constants';
import { EventComponentCleanerHandler } from './cleaner';
import { EventComponentCreateHandler } from './create';

export function definEventComponentHandlers() : ComponentHandlers {
    const manager = new ComponentHandlers();

    manager.mount(EventCommand.CREATE, new EventComponentCreateHandler());
    manager.mount(EventCommand.CLEAN, new EventComponentCleanerHandler());

    return manager;
}
