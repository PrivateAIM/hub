/*
 * Copyright (c) 2023-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Readable } from 'node:stream';
import type { Container } from 'dockerode';
import type { Header } from 'tar-stream';
import tar from 'tar-stream';

export type DockerContainerPackOptions = {
    path: string,

    validateEntry?: (entry: Header) => void,

    onEntryPackStarted?: (entry: Header) => void,
    onEntryPackFinished?: (entry: Header) => void,
    onEntryPackFailed?: (error: Error, entry: Header) => void,
};

export async function packDockerContainerWithTarStream(
    container: Container,
    readable: Readable,
    options: DockerContainerPackOptions,
) {
    return new Promise<void>((resolve, reject) => {
        readable.on('error', (err) => reject(err));

        const pack = tar.pack();

        const extract = tar.extract();
        extract.on('error', (err) => reject(err));

        extract.on('entry', (headers, stream, callback) => {
            if (options.onEntryPackStarted) {
                options.onEntryPackStarted(headers);
            }

            if (options.validateEntry) {
                try {
                    options.validateEntry(headers);
                } catch (e) {
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

            stream.on('data', (chunk) => {
                const written = entry.write(chunk);
                if (!written) {
                    stream.pause();
                    entry.once('drain', () => stream.resume());
                }
            });

            stream.on('end', () => {
                // streamx types end()'s argument as required; the runtime no-ops on
                // undefined, so this stays a plain end().
                entry.end(undefined);
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

        // tar-stream >= 3.2.1 types pack/extract as `streamx` streams rather than node
        // ones. docker-modem only calls .on('error') and .pipe(req) on the archive, never
        // the members streamx lacks (isPaused/unpipe/wrap), so the bridge is honest.
        container.putArchive(pack as unknown as NodeJS.ReadableStream, { path: options.path })
            .then(() => resolve())
            .catch((err) => reject(err));

        // node's pipe drives the streamx destination through write/end/'drain'.
        readable.pipe(extract as unknown as NodeJS.WritableStream);
    });
}
