/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';

type FakeLogEntry = {
    level: keyof Logger,
    message: string | Record<string, any>,
    meta: Record<string, any>,
};

export class FakeLogger implements Logger {
    entries: FakeLogEntry[] = [];

    protected record(level: keyof Logger, message: string | Record<string, any>, meta: Record<string, any>[]): Logger {
        this.entries.push({
            level, 
            message, 
            meta: Object.assign({}, ...meta), 
        });
        return this;
    }

    emerg(message: string | Record<string, any>, ...meta: Record<string, any>[]) { return this.record('emerg', message, meta); }

    alert(message: string | Record<string, any>, ...meta: Record<string, any>[]) { return this.record('alert', message, meta); }

    crit(message: string | Record<string, any>, ...meta: Record<string, any>[]) { return this.record('crit', message, meta); }

    error(message: string | Record<string, any>, ...meta: Record<string, any>[]) { return this.record('error', message, meta); }

    warn(message: string | Record<string, any>, ...meta: Record<string, any>[]) { return this.record('warn', message, meta); }

    notice(message: string | Record<string, any>, ...meta: Record<string, any>[]) { return this.record('notice', message, meta); }

    info(message: string | Record<string, any>, ...meta: Record<string, any>[]) { return this.record('info', message, meta); }

    debug(message: string | Record<string, any>, ...meta: Record<string, any>[]) { return this.record('debug', message, meta); }
}
