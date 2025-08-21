/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ComponentHandlers } from '@privateaim/server-kit';
import { LogCommand } from '@privateaim/server-telemetry-kit';
import { LogComponentWriteHandler } from './write';

export function definLogComponentHandlers() : ComponentHandlers {
    const manager = new ComponentHandlers();

    manager.mount(LogCommand.WRITE, new LogComponentWriteHandler());

    return manager;
}
