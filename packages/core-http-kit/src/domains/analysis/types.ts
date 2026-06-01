/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';

export type AnalysisCreatePayload =    & Pick<Analysis, 'project_id'> &
    Partial<Pick<Analysis, 'name' | 'display_name' | 'description' | 'master_image_id' | 'registry_id' | 'image_command_arguments'>>;

export type AnalysisUpdatePayload = Partial<AnalysisCreatePayload>;
