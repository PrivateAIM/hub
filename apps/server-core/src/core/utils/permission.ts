/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

// The shared implementation lives in server-kit; re-exported so call sites keep importing from core.
export { holdsPermission, isPermissionDenial } from '@privateaim/server-kit';
