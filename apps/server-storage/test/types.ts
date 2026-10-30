/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import 'vitest';

declare module 'vitest' {
    // Vitest requires this exact interface name for declaration merging.
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export interface ProvidedContext {
        MINIO_CONTAINER_HOST: string
        MINIO_CONTAINER_PORT: number
    }
}
