/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EnvironmentName } from '@privateaim/server-kit';
import { ConfigDefaults } from './constants.ts';
import type { Config } from './types.ts';

export function normalizeConfig(input: Partial<Config>): Config {
    return {
        env: input.env ?? EnvironmentName.DEVELOPMENT,
        port: input.port ?? ConfigDefaults.PORT,

        realm: input.realm ?? ConfigDefaults.REALM,

        clientId: input.clientId ?? ConfigDefaults.CLIENT_ID,
        clientSecret: input.clientSecret ?? ConfigDefaults.CLIENT_SECRET,

        publicURL: input.publicURL ?? `http://127.0.0.1:${input.port ?? ConfigDefaults.PORT}/`,

        authupURL: input.authupURL,
        telemetryURL: input.telemetryURL,
        harborURL: input.harborURL,

        redisConnectionString: input.redisConnectionString,
        rabbitMqConnectionString: input.rabbitMqConnectionString,
        vaultConnectionString: input.vaultConnectionString,

        masterImagesOwner: input.masterImagesOwner ?? ConfigDefaults.MASTER_IMAGES_OWNER,
        masterImagesRepository: input.masterImagesRepository ?? ConfigDefaults.MASTER_IMAGES_REPOSITORY,
        masterImagesBranch: input.masterImagesBranch ?? ConfigDefaults.MASTER_IMAGES_BRANCH,

        skipProjectApproval: input.skipProjectApproval ?? false,
        skipAnalysisApproval: input.skipAnalysisApproval ?? false,
    };
}
