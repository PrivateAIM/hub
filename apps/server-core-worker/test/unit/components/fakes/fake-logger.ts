/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';

export type FakeLogEntry = {
    level: string,
    message: string,
    meta: Record<string, unknown>,
};

type FakeLogInput = string | { message: string | Error, [key: string]: any };

/**
 * `Logger` fake that records every call. The three call shapes of a level
 * function (message, message + meta, entry object) are normalised to
 * `{ level, message, meta }`; an `Error` message becomes its `.message`.
 */
export class FakeLogger implements Logger {
    public readonly entries : FakeLogEntry[] = [];

    emerg = this.createLevel('emerg');

    alert = this.createLevel('alert');

    crit = this.createLevel('crit');

    error = this.createLevel('error');

    warn = this.createLevel('warn');

    notice = this.createLevel('notice');

    info = this.createLevel('info');

    debug = this.createLevel('debug');

    entriesOf(level: string) : FakeLogEntry[] {
        return this.entries.filter((entry) => entry.level === level);
    }

    protected createLevel(level: string) {
        return (input: FakeLogInput, ...meta: Record<string, unknown>[]) : Logger => {
            if (typeof input === 'string') {
                this.entries.push({
                    level,
                    message: input,
                    meta: Object.assign({}, ...meta),
                });
            } else {
                const { message, ...rest } = input;

                this.entries.push({
                    level,
                    message: typeof message === 'string' ? message : message.message,
                    meta: Object.assign({}, rest, ...meta),
                });
            }

            return this;
        };
    }
}
