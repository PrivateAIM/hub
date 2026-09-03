/*
 * Copyright (c) 2023-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Readable } from 'node:stream';
import type { Headers } from 'tar-stream';
import tar from 'tar-stream';

/**
 * Mode for the directories synthesized below. The incoming stream carries file
 * entries only (see packBucketFiles), so docker's extractor would otherwise
 * materialize every nested parent itself, at root:root 0755 — leaving an
 * unprivileged analysis unable to write anywhere but the root of its own tree.
 */
const DIRECTORY_MODE = 0o777;

/**
 * Ancestors of `name` that have not been packed yet, outermost first, each
 * recorded in `seen`.
 */
function collectDirectories(name: string, seen: Set<string>): string[] {
    const segments = name.split('/');
    segments.pop();

    const output: string[] = [];
    let current = '';

    for (const segment of segments) {
        if (segment.length === 0 || segment === '.') {
            continue;
        }

        current = current.length > 0 ? `${current}/${segment}` : segment;

        if (seen.has(current)) {
            continue;
        }

        seen.add(current);
        output.push(`${current}/`);
    }

    return output;
}

/**
 * The slice of dockerode's Container this needs. Declared structurally so the
 * pack pipeline can be exercised without a docker daemon.
 */
export type DockerContainerPackTarget = {
    putArchive(file: Readable, options: { path: string }): Promise<unknown>;
};

export type DockerContainerPackOptions = {
    path: string,

    validateEntry?: (entry: Headers) => void,

    onEntryPackStarted?: (entry: Headers) => void,
    onEntryPackFinished?: (entry: Headers) => void,
    onEntryPackFailed?: (error: Error, entry: Headers) => void,
};

export async function packDockerContainerWithTarStream(
    container: DockerContainerPackTarget,
    readable: Readable,
    options: DockerContainerPackOptions,
) {
    return new Promise<void>((resolve, reject) => {
        const pack = tar.pack();
        const directories = new Set<string>();

        // Tearing the output pack down matters: putArchive is already streaming
        // it as its request body, so leaving it neither finalized nor destroyed
        // stalls that request until the daemon times out.
        const fail = (err: Error) => {
            pack.destroy(err);
            reject(err);
        };

        readable.on('error', (err) => fail(err));

        const extract = tar.extract();
        extract.on('error', (err) => fail(err));

        extract.on('entry', (headers, stream, callback) => {
            // Destroying the extract destroys the entry stream with it, so this
            // has to be attached before anything below can bail out: without a
            // listener that teardown is an uncaught exception, which takes the
            // worker process down instead of failing the build. The cause is
            // reported through the extract's own error handler.
            stream.on('error', () => { /* reported via extract */ });

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

            if (headers.type === 'directory') {
                directories.add(headers.name.replace(/\/+$/, ''));
                headers.mode = DIRECTORY_MODE;
            } else {
                for (const directory of collectDirectories(headers.name, directories)) {
                    pack.entry({
                        name: directory,
                        type: 'directory',
                        mode: DIRECTORY_MODE,
                        uid: 0,
                        gid: 0,
                    }, Buffer.alloc(0));
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
            .catch((err) => reject(err));

        readable.pipe(extract);
    });
}
