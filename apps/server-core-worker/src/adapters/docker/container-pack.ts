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
        const extract = tar.extract();
        const directories = new Set<string>();

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

            if (headers.type === 'directory') {
                // `collectDirectories` treats its argument as a file path and
                // pops the last segment off as the "basename" that is not
                // itself an ancestor — pass the trimmed name (no trailing
                // slash) so the directory's OWN segment gets popped the same
                // way a file's would, leaving only its real ancestors.
                const name = headers.name.replace(/\/+$/, '');

                for (const directory of collectDirectories(name, directories)) {
                    pack.entry({
                        name: directory,
                        type: 'directory',
                        mode: DIRECTORY_MODE,
                        uid: 0,
                        gid: 0,
                    }, Buffer.alloc(0));
                }

                directories.add(name);
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
                // Do NOT call onEntryPackFailed here: destroying the entry
                // below makes tar-stream's Sink invoke the SAME completion
                // callback passed to pack.entry() above, with this same
                // error — that callback already calls onEntryPackFailed and
                // forwards to extract's callback(). Calling it here too would
                // double every failure notification for one real error.
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
