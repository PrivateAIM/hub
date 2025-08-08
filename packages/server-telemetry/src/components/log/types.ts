/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { LogCommand } from './constants';
import type {
    LogWriteCommandPayload,
} from './handlers/write';

//-----------------------------------------------------------------------

type LogCommandMapRaw = {
    [LogCommand.WRITE]: LogWriteCommandPayload,
};

export type LogCommandMap = {
    [K in keyof LogCommandMapRaw as `${K}`]: LogCommandMapRaw[K]
};

export type LogCommandContext = {
    [K in keyof LogCommandMap]: {
        command: K,
        data: LogCommandMap[K]
    }
}[keyof LogCommandMap];

//-----------------------------------------------------------------------

type LogEventMapRaw = {
    [key: string]: any
};

export type LogEventMap = {
    [K in keyof LogEventMapRaw as `${K}`]: LogEventMapRaw[K]
};

export type LogEventContext = {
    [K in keyof LogEventMap]: {
        event: K,
        data: LogEventMap[K]
    }
}[keyof LogEventMap];
