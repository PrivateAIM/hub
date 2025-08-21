/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { nanoSeconds } from '@hapic/loki';
import type { Log, LogInput } from '@privateaim/telemetry-kit';
import { LogChannel, LogFlag, LogLevel } from '@privateaim/telemetry-kit';

export abstract class BaseLogStore {
    protected labels: Record<string, string>;

    setLabels(labels: Record<string, string>): void {
        this.labels = labels;
    }

    getLabels() : Record<string, string> {
        return this.labels;
    }

    extendLabels(labels: Record<string, string>): void {
        const keys = Object.keys(labels);
        for (let i = 0; i < keys.length; i++) {
            this.labels[keys[i]] = labels[keys[i]];
        }
    }

    protected normalizeInput(
        input: string | LogInput,
        labels: Record<string, string> = {},
    ) : Log {
        const data : LogInput = {
            message: '',
            channel: LogChannel.SYSTEM,
            service: 'unknown',
            level: LogLevel.DEBUG,
        };

        if (typeof input === 'string') {
            data.message = input;

            data.labels = {
                ...this.labels,
                ...(labels || {}),
            };

            if (data.labels[LogFlag.CHANNEL]) {
                data.service = data.labels[LogFlag.CHANNEL];
            }
            delete data.labels[LogFlag.CHANNEL];

            if (data.labels[LogFlag.LEVEL]) {
                data.level = data.labels[LogFlag.LEVEL] as LogLevel;
            }
            delete data.labels[LogFlag.LEVEL];

            if (data.labels[LogFlag.SERVICE]) {
                data.service = data.labels[LogFlag.SERVICE];
            }
            delete data.labels[LogFlag.SERVICE];
        } else {
            data.message = input.message;

            data.labels = {
                ...this.labels,
                ...(input.labels || {}),
                ...(labels || {}),
            };

            if (input.time) {
                data.time = input.time;
            }

            if (input.channel) {
                data.channel = input.channel;
            } else if (data.labels[LogFlag.CHANNEL]) {
                data.channel = data.labels[LogFlag.CHANNEL] as LogChannel;
            }
            delete data.labels[LogFlag.CHANNEL];

            if (input.level) {
                data.level = input.level;
            } else if (data.labels[LogFlag.LEVEL]) {
                data.level = data.labels[LogFlag.LEVEL] as LogLevel;
            }
            delete data.labels[LogFlag.LEVEL];

            if (input.service) {
                data.service = input.service;
            } else if (data.labels[LogFlag.SERVICE]) {
                data.service = data.labels[LogFlag.SERVICE];
            }
            delete data.labels[LogFlag.SERVICE];
        }

        return {
            ...data,
            time: data.time || nanoSeconds(),
            labels: data.labels || {},
        };
    }
}
