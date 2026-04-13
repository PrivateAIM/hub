/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IModule } from 'orkos';
import { Application } from 'orkos';
import type { AmqpModuleOptions } from '../../services/amqp/di-module';
import { AmqpModule } from '../../services/amqp/di-module';
import type { AuthupHookModuleOptions } from '../../services/authup/client-hook/di-module';
import { AuthupHookModule } from '../../services/authup/client-hook/di-module';
import type { AuthupClientModuleOptions } from '../../services/authup/client/di-module';
import { AuthupClientModule } from '../../services/authup/client/di-module';
import { CacheModule } from '../../services/cache/di-module';
import type { EntityEventModuleOptions } from '../../services/entity-event/di-module';
import { EntityEventModule } from '../../services/entity-event/di-module';
import type { LoggerModuleOptions } from '../../services/logger/di-module';
import { LoggerModule } from '../../services/logger/di-module';
import type { RedisModuleOptions } from '../../services/redis/di-module';
import { RedisModule } from '../../services/redis/di-module';
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
        }
        return this;
    }

    withAmqp(options?: AmqpModuleOptions | false): this {
        if (options !== false) {
            this.modules.push(new AmqpModule(options));
        }
        return this;
    }

    withAuthupHook(options: AuthupHookModuleOptions | false): this {
        if (options !== false) {
            this.modules.push(new AuthupHookModule(options));
        }
        return this;
    }

    withAuthup(options: AuthupClientModuleOptions | false): this {
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
