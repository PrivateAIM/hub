/*
 * Copyright (c) 2023-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Readable } from 'node:stream';
import type { Container } from 'dockerode';
import type { Headers } from 'tar-stream';
import tar from 'tar-stream';

export type DockerContainerPackOptions = {
    path: string,

    validateEntry?: (entry: Headers) => void,

    onEntryPackStarted?: (entry: Headers) => void,
    onEntryPackFinished?: (entry: Headers) => void,
    onEntryPackFailed?: (error: Error, entry: Headers) => void,
};

export async function packDockerContainerWithTarStream(
    container: Container,
    readable: Readable,
    options: DockerContainerPackOptions,
) {
    return new Promise<void>((resolve, reject) => {
        const pack = tar.pack();
        const extract = tar.extract();

        // Every failure route has to end the same way, because two of the three
        // streams here outlive a plain `reject()`:
        //
        // - `pack` is already being consumed by `putArchive`, so an un-finalized,
        //   un-destroyed pack leaves that request body open forever. The caller's
        //   `container.remove({ force: true })` then blocks behind the in-flight
        //   archive request and the build never settles.
        // - `readable` is the storage download, and node's `pipe()` does not
        //   forward a SOURCE error to the destination — so nothing else ends it.
        let failed = false;
        const fail = (err: Error) => {
            if (failed) {
                return;
            }

            failed = true;

            pack.destroy(err);
            readable.destroy();

            reject(err);
        };

        readable.on('error', fail);
        extract.on('error', fail);

        extract.on('entry', (headers, stream, callback) => {
            // streamx re-throws an 'error' that has no listener as an
            // uncaughtException, which kills the worker before the caller can
            // remove its container. Both this entry stream and the pack sink
            // below are destroyed on the failure paths — the error itself is
            // surfaced through `fail`, so these listeners only need to exist.
            // This one is NOT the handler further down: it has to be registered
            // before the `validateEntry` catch returns early, which is a path
            // that handler never reaches.
            stream.on('error', () => { /* surfaced through fail */ });

            if (options.onEntryPackStarted) {
                options.onEntryPackStarted(headers);
            }

            if (options.validateEntry) {
                try {
                    options.validateEntry(headers);
                } catch (e) {
                    fail(e);
                    callback(e);

                    return;
                }
            }

            const entry = pack.entry(
                headers,
                (err) => {
                    if (err) {
                        if (options.onEntryPackFailed) {
                            options.onEntryPackFailed(err, headers);
                        }

                        callback(err);
                        return;
                    }

                    if (options.onEntryPackFinished) {
                        options.onEntryPackFinished(headers);
                    }

                    callback();
                },
            );

            entry.on('error', () => { /* surfaced through fail */ });

            stream.on('data', (chunk) => {
                const written = entry.write(chunk);
                if (!written) {
                    stream.pause();
                    entry.once('drain', () => stream.resume());
                }
            });

            stream.on('end', () => {
                entry.end();
            });

            stream.on('error', (err) => {
                if (options.onEntryPackFailed) {
                    options.onEntryPackFailed(err, headers);
                }

                entry.destroy(err);
            });

            stream.resume();
        });

        extract.on('finish', () => {
            pack.finalize();
        });

        container.putArchive(pack, { path: options.path })
            .then(() => resolve())
            .catch(fail);

        readable.pipe(extract);
    });
}
