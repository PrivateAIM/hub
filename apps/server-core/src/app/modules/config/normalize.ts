/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EnvironmentName } from '@privateaim/server-kit';
import { ConfigDefaults } from './constants.ts';
import type { Config } from './types.ts';
import { ConfigValidator } from './validator.ts';

const validator = new ConfigValidator();

export async function normalizeConfig(input: Partial<Config>): Promise<Config> {
    const validated = await validator.run(input);

    return {
        ...validated,
        env: validated.env ?? EnvironmentName.DEVELOPMENT,
        port: validated.port ?? ConfigDefaults.PORT,

        realm: validated.realm ?? ConfigDefaults.REALM,
        clientId: validated.clientId ?? ConfigDefaults.CLIENT_ID,
        clientSecret: validated.clientSecret ?? ConfigDefaults.CLIENT_SECRET,

        publicURL: validated.publicURL ?? `http://127.0.0.1:${validated.port ?? ConfigDefaults.PORT}/`,

        masterImagesOwner: validated.masterImagesOwner ?? ConfigDefaults.MASTER_IMAGES_OWNER,
        masterImagesRepository: validated.masterImagesRepository ?? ConfigDefaults.MASTER_IMAGES_REPOSITORY,
        masterImagesBranch: validated.masterImagesBranch ?? ConfigDefaults.MASTER_IMAGES_BRANCH,

        skipProjectApproval: validated.skipProjectApproval ?? false,
        skipAnalysisApproval: validated.skipAnalysisApproval ?? false,
    };
}
