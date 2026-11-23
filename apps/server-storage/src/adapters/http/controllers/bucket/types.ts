/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Who an upload is recorded for: the request identity, or the subject of a
 * capability token.
 */
export type BucketFileUploader = {
    type: 'user' | 'client',
    id: string,
    realmId: string,
};
