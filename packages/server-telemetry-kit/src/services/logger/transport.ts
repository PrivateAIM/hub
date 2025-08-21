/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { LogInput } from '@privateaim/telemetry-kit';
import WinstonTransport from 'winston-transport';
import type { LoggerTransportOptions, LoggerTransportSaveFn } from './type';

export class LoggerTransport extends WinstonTransport {
    protected labels: Record<string, string>;

    protected save : LoggerTransportSaveFn;

    constructor(options: LoggerTransportOptions) {
        super(options);

        this.labels = options.labels || {};
        this.save = options.save;
    }

    log(info: Record<PropertyKey, any>, next: () => void): any {
        const payload = this.normalizeInput(info);

        Promise.resolve()
            .then(() => this.save(payload))
            .then(() => next());
    }

    protected normalizeInput(info: Record<PropertyKey, any>) : LogInput {
        const {
            message, timestamp, stack, ...data
        } = info;

        const labels : Record<string, string> = {
            ...this.labels,
        };
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

        return {
            message: stack || message,
            time: (BigInt(date.getTime()) * 1_000_000n).toString(),
            labels,
        };
    }
}
