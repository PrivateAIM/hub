/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildNavigation } from '@vuecs/navigation';

export default defineNuxtRouteMiddleware(async (route) => {
    await buildNavigation({ route });
});
