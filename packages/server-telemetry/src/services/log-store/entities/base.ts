/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

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
}
