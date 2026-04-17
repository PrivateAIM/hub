/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BaseApplicationBuilder } from '@privateaim/server-kit';
import type { IModule } from 'orkos';
import { ConfigModule } from './modules/config/index.ts';
import { DatabaseModule } from './modules/database/index.ts';
import { HTTPModule } from './modules/http/index.ts';

export class ServerTelemetryApplicationBuilder extends BaseApplicationBuilder {
    withConfig(instance?: ConfigModule | false): this {
        return this.addModuleSlot('config', instance, () => new ConfigModule());
    }

    withDatabase(instance?: DatabaseModule | false): this {
        return this.addModuleSlot('database', instance, () => new DatabaseModule());
    }

    withHTTP(instance?: HTTPModule | false): this {
        return this.addModuleSlot('http', instance, () => new HTTPModule());
    }

    private addModuleSlot(name: string, instance: IModule | false | undefined, factory: () => IModule): this {
        if (instance === false) {
            return this;
        }

        this.modules.push(instance ?? factory());
        return this;
    }
}
