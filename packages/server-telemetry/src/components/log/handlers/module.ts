/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Component } from '@privateaim/server-kit';
import { LogCommand } from '@privateaim/server-telemetry-kit';
import { LogComponentWriteHandler } from './write';

export function definLogComponentHandlers() : Component {
    const manager = new Component();

    manager.mount(LogCommand.WRITE, new LogComponentWriteHandler());

    return manager;
}
