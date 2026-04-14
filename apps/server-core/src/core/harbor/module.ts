/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { parseConnectionString } from '@hapic/harbor';
import type { Registry } from '@privateaim/core-kit';
import { getHostNameFromString } from '@privateaim/kit';
import type { IEntityRepository } from '../entities/types.ts';
import type { IRegistryCaller } from '../services/types.ts';

type SetupHarborContext = {
    harborURL: string;
    registryRepository: IEntityRepository<Registry>;
    registryCaller?: IRegistryCaller;
};

export async function setupHarborService(ctx: SetupHarborContext) {
    const connection = parseConnectionString(ctx.harborURL);
    const host = getHostNameFromString(connection.host);

    let entity = await ctx.registryRepository.findOneBy({ name: 'default' });
    if (entity) {
        entity.account_name = connection.user;
        entity.account_secret = connection.password;
    } else {
        entity = ctx.registryRepository.create({
            name: 'default',
            host,
            account_name: connection.user,
            account_secret: connection.password,
        });
    }

    await ctx.registryRepository.save(entity);

    if (ctx.registryCaller) {
        await ctx.registryCaller.call('SETUP', { id: entity.id }, {});
    }
}
