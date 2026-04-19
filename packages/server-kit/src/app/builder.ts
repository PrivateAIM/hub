/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IModule } from 'orkos';
import { Application } from 'orkos';
import type { AmqpModuleOptions } from '../amqp/di-module';
import { AmqpModule } from '../amqp/di-module';
import type { AuthupHookModuleOptions } from '../authup/client-hook/di-module';
import { AuthupHookModule } from '../authup/client-hook/di-module';
import type { AuthupClientModuleOptions } from '../authup/client/di-module';
import { AuthupClientModule } from '../authup/client/di-module';
import { CacheModule } from '../cache/di-module';
import type { EntityEventModuleOptions } from '../entity-event/di-module';
import { EntityEventModule } from '../entity-event/di-module';
import type { LoggerModuleOptions } from '../logger/di-module';
import { LoggerModule } from '../logger/di-module';
import type { RedisModuleOptions } from '../redis/di-module';
import { RedisModule } from '../redis/di-module';
import { QueueRouterModule } from '../queue-router/di-module';

export class BaseApplicationBuilder {
    protected modules: IModule[] = [];

    withLogger(options?: LoggerModuleOptions | false): this {
        if (options !== false) {
            this.modules.push(new LoggerModule(options));
        }
        return this;
    }

    withRedis(options?: RedisModuleOptions | false): this {
        if (options !== false) {
            this.modules.push(new RedisModule(options));
            this.modules.push(new CacheModule());
        }
        return this;
    }

    withAmqp(options?: AmqpModuleOptions | false): this {
        if (options !== false) {
            this.modules.push(new AmqpModule(options));
            this.modules.push(new QueueRouterModule());
        }
        return this;
    }

    withAuthupHook(options: AuthupHookModuleOptions | false): this {
        if (options !== false) {
            this.modules.push(new AuthupHookModule(options));
        }
        return this;
    }

    withAuthupClient(options: AuthupClientModuleOptions | false): this {
        if (options !== false) {
            this.modules.push(new AuthupClientModule(options));
        }
        return this;
    }

    withCache(): this {
        this.modules.push(new CacheModule());
        return this;
    }

    withEntityEvent(options?: EntityEventModuleOptions | false): this {
        if (options !== false) {
            this.modules.push(new EntityEventModule(options));
        }
        return this;
    }

    withQueueRouter(): this {
        this.modules.push(new QueueRouterModule());
        return this;
    }

    build(): Application {
        return new Application({ modules: this.modules });
    }
}
