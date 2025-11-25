/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from 'node:fs';
import { Readable } from 'node:stream';
import path from 'node:path';
import tar from 'tar-stream';
import { streamToBuffer } from '../../src/core';
import type { BucketFileEntity } from '../../src/domains';
import {
    createTestSuite,
    expectPropertiesEqualToSrc,
    removeDateProperties,
} from '../utils';

describe('controllers/bucket-file', () => {
    const suite = createTestSuite();

    beforeAll(async () => {
        await suite.up();
    });

    afterAll(async () => {
        await suite.down();
    });

    let details : BucketFileEntity;

    it('should create resource', async () => {
        const client = suite.client();

        const bucket = await client.bucket.create({
            name: 'foo-bar-baz',
            region: 'eu-west',
        });

        const filePath = path.join(__dirname, '..', 'data', 'file.json');
        const file = await fs.promises.readFile(filePath);

        const formData = new FormData();
        formData.append('file[0]', new Blob([file as BlobPart]), 'file.json');

        const bucketFiles = await client.bucket.upload(bucket.id, formData);
        expect(bucketFiles.data.length).toBeGreaterThanOrEqual(1);

        details = removeDateProperties((bucketFiles.data)[0]);
    });

    it('should get collection', async () => {
        const client = suite.client();
        const { data } = await client.bucketFile.getMany();

        expect(data.length).toBeGreaterThanOrEqual(1);
    });

    it('should read resource', async () => {
        const client = suite.client();

        const data = await client.bucketFile.getOne(details.id);

        expectPropertiesEqualToSrc(details, data);
    });

    it('should stream resource', async () => {
        const client = suite.client();
        const data = await client.bucketFile.stream(details.id);
        const stream = Readable.fromWeb(data as any);
        const buffer = await streamToBuffer(stream);
        expect(buffer.byteLength).toBeGreaterThan(0);
    });

    it('should stream resource collection', (done) => {
        const client = suite.client();
        const extract = tar.extract();

        const headers : Record<string, any>[] = [];

        extract.on('entry', async (header, stream, callback) => {
            headers.push(header);

            callback();
        });

        extract.on('finish', () => {
            expect(headers.length).toBeGreaterThanOrEqual(1);
            done();
        });

        client.bucket.stream(details.bucket_id)
            .then((data) => Readable.fromWeb(data as any))
            .then((data) => {
                data.pipe(extract);
            })
            .catch((e) => done(e));
    });

    it('should delete resource', async () => {
        const client = suite.client();
        await client.bucketFile.delete(details.id);
    });
});
