/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TypedToken } from 'eldin';
import type { Client } from 'amqp-extension';

export const AMQP_MODULE_NAME = 'amqp';

export const AmqpClientInjectionKey = new TypedToken<Client>('AmqpClient');
