/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Readable } from 'node:stream';

export async function streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise <Buffer>((resolve, reject) => {
        const parts : Buffer[] = [];

        stream.on('data', (chunk) => {
            const data = Buffer.isBuffer(chunk) ?
                chunk :
                Buffer.from(chunk);
            parts.push(data);
        });

        stream.on('end', () => resolve(Buffer.concat(parts)));

        stream.on('error', (err) => reject(err));

        stream.resume();
    });
}
