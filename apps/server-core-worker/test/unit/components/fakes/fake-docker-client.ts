/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

export type FakeDockerImageCall = {
    name: string,
    operation: 'distribution' | 'inspect' | 'tag' | 'push' | 'remove',
    authconfig?: unknown
};

export type FakeDockerClientOptions = {
    /** Rejects `.distribution()` — used to fake a missing/unreachable registry image. */
    distributionError?: unknown,
    /** Rejects `.inspect()` — used to fake a missing/unreachable local image. */
    inspectError?: unknown,
    /** Resolved by `.inspect()` when no `inspectError` is set. */
    inspectInfo?: Record<string, any>,
    /** Rejects `.push()` — used to fake an unreachable registry. */
    pushError?: unknown
};

/**
 * The slice of the `docken` client the worker components use:
 * `getImage(name)` returning `{ distribution({ authconfig }), inspect(), tag(), push(), remove() }`,
 * plus the `modem` docken's `waitForStream` follows (a push stream that finishes at once).
 *
 * Records every lookup so a spec can assert WHICH image URL was probed — that
 * URL is assembled from registry host + registry project + analysis id, and is
 * the part most likely to regress silently.
 */
export class FakeDockerClient {
    public readonly calls : FakeDockerImageCall[] = [];

    protected options : FakeDockerClientOptions;

    constructor(options: FakeDockerClientOptions = {}) {
        this.options = options;
    }

    getImage(name: string) {
        return {
            distribution: async (options: { authconfig: unknown }) => {
                this.calls.push({
                    name, 
                    operation: 'distribution', 
                    authconfig: options.authconfig, 
                });

                if (this.options.distributionError) {
                    throw this.options.distributionError;
                }

                return {};
            },
            inspect: async () => {
                this.calls.push({ name, operation: 'inspect' });

                if (this.options.inspectError) {
                    throw this.options.inspectError;
                }

                return this.options.inspectInfo;
            },
            tag: async () => {
                this.calls.push({ name, operation: 'tag' });
            },
            push: async () => {
                this.calls.push({ name, operation: 'push' });

                if (this.options.pushError) {
                    throw this.options.pushError;
                }

                return {};
            },
            remove: async () => {
                this.calls.push({ name, operation: 'remove' });
            },
        };
    }

    readonly modem = {
        followProgress: (_stream: unknown, onFinished: (error: unknown, output: unknown[]) => void) => {
            onFinished(null, []);
        },
    };

    removed() : string[] {
        return this.calls
            .filter((call) => call.operation === 'remove')
            .map((call) => call.name);
    }
}
