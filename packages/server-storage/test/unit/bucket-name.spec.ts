/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import {
    describe, expect, it,
} from 'vitest';
import { toBucketName } from '../../src/domains';

describe('src/domains/bucket', () => {
    it('should serialize bucket name', () => {
        let output = toBucketName('805735EC-6A00-4368-88CD-83C818806f7A');
        expect(output).toEqual('805735ec-6a00-4368-88cd-83c818806f7a');

        output = toBucketName('805735ec-6a00-4368-88cd-83c818806f7a-83c818806f7a-83c818806f7a-foo');
        expect(output).toEqual('805735ec-6a00-4368-88cd-83c818806f7a-83c818806f7a-83c818806f7a-');
    });
});
