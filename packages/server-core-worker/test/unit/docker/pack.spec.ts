/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { packDockerContainerWithTarStream, useDocker } from '../../../src/core/index.ts';

describe('docker/pack', () => {
    it('should pack docker container with tar stream', async () => {
        const docker = useDocker();

        const container = await docker
            .createContainer({ Image: 'alpine:latest' });

        const fileStream = fs.createReadStream('test/data/stream.tar');

        await packDockerContainerWithTarStream(container, fileStream, {
            path: '/opt',
        });

        await container.commit({
            repo: 'alpine',
            tag: 'test',
        });

        const image = docker.getImage('alpine:test');
        const imageInfo = await image.inspect();

        expect(imageInfo.Size).toBeGreaterThan(0);

        const testContainer = await docker.createContainer({
            Image: imageInfo.Id,
            Cmd: ['sh', '-c', 'sleep 300'],
        });

        try {
            await testContainer.start();

            const exec = await testContainer.exec({
                Cmd: ['stat', '-c', '%s', '/opt/run_star_model.py'],
                AttachStdout: true,
                AttachStderr: true,
            });

            const stream = await exec.start({ hijack: true, stdin: false });
            const size = await new Promise<Buffer>(
                (resolve, reject) => {
                    const data : Buffer[] = [];
                    stream.on('data', (chunk) => {
                        const buffer = Buffer.isBuffer(chunk) ?
                            chunk :
                            Buffer.from(chunk);

                        data.push(buffer);
                    });

                    stream.on('end', () => resolve(Buffer.concat(data)));
                    stream.on('error', (err) => reject(err));

                    stream.resume();
                },
            );

            expect(size.toString('utf-8')).toContain('4224');
        } finally {
            await container.remove();
            await testContainer.stop();
            await testContainer.remove();
        }
    }, 30_000);
});
