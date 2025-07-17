/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { TransportStreamOptions } from 'winston-transport';
import WinstonTransport from 'winston-transport';
import type { LogMessage, LogStore } from '../log-store';

type LogStoreTransportOptions = TransportStreamOptions & {
    labels?: Record<string, string>
};

export class LogStoreTransport extends WinstonTransport {
    protected instance : LogStore;

    protected labels : Record<string, string>;

    constructor(store: LogStore, options: LogStoreTransportOptions = {}) {
        super(options);

        this.instance = store;
        this.labels = options.labels || {};
    }

    log(info: Record<PropertyKey, any>, next: () => void): any {
        const {
            message, timestamp, stack, ...data
        } = info;

        const labels : Record<string, string> = {};
        const keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            if (typeof keys[i] !== 'string') {
                continue;
            }

            const value = data[keys[i]];

            if (
                typeof value === 'string' ||
                typeof value === 'number' ||
                typeof value === 'boolean'
            ) {
                labels[keys[i]] = `${value}`;
            }
        }

        let date : Date;
        if (typeof timestamp === 'string') {
            date = new Date(`${timestamp}`);
        } else {
            date = new Date();
        }

        const payload : LogMessage = {
            message: stack || message,
            time: BigInt(date.getTime()) * 1_000_000n,
            labels: {
                ...this.labels,
                ...labels,
            },
        };

        Promise.resolve()
            .then(() => this.instance.write(payload))
            .then(() => next());
    }
}
