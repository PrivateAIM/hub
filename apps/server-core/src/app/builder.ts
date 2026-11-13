/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BaseApplicationBuilder, TaggedCacheModule } from '@privateaim/server-kit';
import type { IModule } from 'orkos';
import { ConfigModule } from './modules/config/index.ts';
import { DatabaseModule, QUERY_CACHE_PREFIX } from './modules/database/index.ts';
import { HTTPModule } from './modules/http/index.ts';
import type { HTTPModuleOptions } from './modules/http/index.ts';

export class ServerCoreApplicationBuilder extends BaseApplicationBuilder {
    withConfig(instance?: ConfigModule | false): this {
        return this.addModuleSlot('config', instance, () => new ConfigModule());
    }

    /**
     * The read cache's store: Redis when the redis module registered a
     * client, process memory otherwise.
     */
    withTaggedCache(instance?: TaggedCacheModule | false): this {
        return this.addModuleSlot('taggedCache', instance, () => new TaggedCacheModule({ prefix: QUERY_CACHE_PREFIX }));
    }

    withDatabase(instance?: DatabaseModule | false): this {
        return this.addModuleSlot('database', instance, () => new DatabaseModule());
    }

    withHTTP(instance?: HTTPModule | false, options?: HTTPModuleOptions): this {
        return this.addModuleSlot('http', instance, () => new HTTPModule(options));
    }

    private addModuleSlot(name: string, instance: IModule | false | undefined, factory: () => IModule): this {
        if (instance === false) {
            return this;
        }

        this.modules.push(instance ?? factory());

        return this;
    }
}
