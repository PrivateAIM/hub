/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { createFakeClient } from '@privateaim/core-http-kit/testing';
import { MasterImageBuilderCommand, MasterImageBuilderEvent } from '@privateaim/server-core-worker-kit';
import { createClient } from 'docken';
import fs from 'node:fs';
import path from 'node:path';
import { 
    afterAll, 
    describe, 
    expect, 
    it, 
} from 'vitest';
import { MasterImageBuilderExecuteHandler } from '../../../../src/app/components/master-image-builder/handlers/execute/module';
import { MASTER_IMAGES_DIRECTORY_PATH } from '../../../../src/constants';
import { FakeComponentHandlerContext } from '../fakes/fake-component-handler-context';

// Needs a real docker daemon, like test/unit/docker/pack.spec.ts. This is the
// only coverage of the tar-fs -> `buildImage` hand-off described in issue #1863:
// `tar.pack()` returns a streamx `Pack` that is not a node `Readable`, so the
// day docker-modem reaches for `isPaused`/`unpipe`/`wrap`, this fails instead of
// shipping broken. (The other half of that hazard — `@types/tar-stream` learning
// that `Pack` is not a node stream — surfaces as a `build:types` failure, not
// here.)

const ID = '44444444-4444-4444-4444-444444444444';

// Namespaced under `data/spec/` so it cannot collide with the real catalogue
// `master-images.spec.ts` clones into the same writable directory.
const RELATIVE_PATH = 'data/spec/master-image-builder';
const VIRTUAL_PATH = 'spec/master-image-builder';
const TAG = `master/${VIRTUAL_PATH}:latest`;

const directory = path.join(MASTER_IMAGES_DIRECTORY_PATH, RELATIVE_PATH);

const docker = createClient();

// `FROM scratch` pulls nothing, so the build is offline and sub-second. The
// `COPY` is the payload assertion: docker fails the build when a copied path is
// missing from the build context, so a build that SUCCEEDS proves the tar the
// streamx `Pack` produced — nested entry included — arrived at the daemon.
async function writeFixture() {
    // The only assertion that can tell a working build from a broken one is
    // "does this tag exist". An image stranded by an interrupted earlier run
    // would satisfy it without anything being built, so clear it first.
    await docker.getImage(TAG).remove({ force: true }).catch(() => { /* absent */ });

    fs.mkdirSync(path.join(directory, 'nested'), { recursive: true });
    fs.writeFileSync(path.join(directory, 'Dockerfile'), 'FROM scratch\nCOPY marker.txt /marker.txt\nCOPY nested/deep.txt /deep.txt\n');
    fs.writeFileSync(path.join(directory, 'marker.txt'), 'marker\n');
    fs.writeFileSync(path.join(directory, 'nested', 'deep.txt'), 'deep\n');
}

describe('MasterImageBuilderExecuteHandler', () => {
    afterAll(async () => {
        await docker.getImage(TAG).remove({ force: true }).catch(() => { /* never built */ });

        fs.rmSync(directory, { recursive: true, force: true });
    });

    it('should build the image from the master image directory', async () => {
        await writeFixture();

        const coreClient = createFakeClient({
            handlers: {
                'GET /master-images/:id': () => ({
                    data: {
                        id: ID,
                        name: 'spec',
                        path: RELATIVE_PATH,
                        virtualPath: VIRTUAL_PATH,
                    },
                    meta: {},
                }),
            },
        });

        const context = new FakeComponentHandlerContext(MasterImageBuilderCommand.EXECUTE);

        await new MasterImageBuilderExecuteHandler({ coreClient, docker })
            .handle({ id: ID }, context);

        // THE assertion. `handleInternal` catches a failing build, logs it and
        // still emits EXECUTION_FINISHED, so the emitted events look identical
        // whether the build worked or not — only the image proves it did.
        const image = await docker.getImage(TAG).inspect();
        expect(image.RepoTags).toContain(TAG);

        expect(context.eventsOf(MasterImageBuilderEvent.EXECUTION_FINISHED)).toHaveLength(1);
        expect(coreClient.requests[0]).toMatchObject({ method: 'GET', params: { id: ID } });
    }, 30_000);
});
