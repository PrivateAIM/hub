/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { LogInput } from '@privateaim/telemetry-kit';
import { LogChannel, LogFlag, LogLevel } from '@privateaim/telemetry-kit';
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
            .finally(() => next());
    }

    protected normalizeInput(info: Record<PropertyKey, any>) : LogInput {
        const {
            message, 
            timestamp, 
            stack, 
            ...data
        } = info;

        let date : Date;
        if (typeof timestamp === 'string') {
            date = new Date(`${timestamp}`);
        } else {
            date = new Date();
        }

        const output : LogInput = {
            message: stack || message,
            time: date.toISOString(),
            labels: { ...this.labels },
            level: LogLevel.DEBUG,
            service: 'unknown',
            channel: LogChannel.SYSTEM,
        };

        const flags = Object.values([
            LogFlag.LEVEL,
            LogFlag.CHANNEL,
            LogFlag.SERVICE,
        ]) as string[];

        let keys = Object.keys(output.labels);
        for (const key of keys) {
            const index = flags.indexOf(key);
            if (index !== -1) {
                output[key] = output.labels[key];
                delete output.labels[key];
            }
        }

        keys = Object.keys(data);
        for (const key of keys) {
            if (typeof key !== 'string') {
                continue;
            }

            const value = data[key];

            if (
                typeof value !== 'string' &&
                typeof value !== 'number' &&
                typeof value !== 'boolean'
            ) {
                continue;
            }

            const index = flags.indexOf(key);
            if (index === -1) {
                output.labels[key] = `${value}`;
            } else {
                output[key] = `${value}`;
            }
        }

        return output;
    }
}
