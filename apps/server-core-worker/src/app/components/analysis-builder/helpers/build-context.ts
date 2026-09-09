/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import { buffer } from 'node:stream/consumers';
import tar from 'tar-stream';
import { ANALYSIS_BUILD_CONTEXT_ARCHIVE, AnalysisContainerPath } from '../constants';

/**
 * Archive holding the (still empty) code directory.
 *
 * It exists because the directory must be created by the builder rather than by
 * a RUN instruction: a RUN executes as the master image's USER, and any image
 * that drops privileges cannot create a directory below a root owned /opt.
 *
 * A COPY/ADD of a *directory* would not do either — docker recreates the
 * destination with its own default ownership and mode (root:root 0755), leaving
 * an unprivileged analysis unable to write next to its own code. Extracting a
 * tar preserves both, which is the only way to hand out a writable directory
 * without knowing which user the master image ends up running as.
 */
function createPathArchive(): Promise<Buffer> {
    const pack = tar.pack();

    pack.entry({
        name: path.posix.basename(AnalysisContainerPath.CODE),
        type: 'directory',
        mode: 0o777,
        uid: 0,
        gid: 0,
    }, Buffer.alloc(0));

    pack.finalize();

    return buffer(pack);
}

/**
 * Build context (the tar handed to docker's build endpoint) for an analysis image.
 */
export async function createBuildContext(dockerfile: string) {
    const pathArchive = await createPathArchive();
    const pack = tar.pack();

    pack.entry({ name: ANALYSIS_BUILD_CONTEXT_ARCHIVE, type: 'file' }, pathArchive);
    pack.entry({ name: 'Dockerfile', type: 'file' }, Buffer.from(dockerfile, 'utf-8'));

    pack.finalize();

    return pack;
}
