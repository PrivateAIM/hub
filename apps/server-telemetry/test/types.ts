/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import 'vitest';

declare module 'vitest' {
    // Vitest requires this exact interface name for declaration merging.
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export interface ProvidedContext {
        VL_CONTAINER_HOST: string
        VL_CONTAINER_PORT: number
    }
}
