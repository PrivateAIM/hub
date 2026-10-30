/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { serve } from 'routup';

export type HTTPServer = ReturnType<typeof serve>;

export type HTTPModuleOptions = {
    skipServer?: boolean;
    socket?: boolean;
};
