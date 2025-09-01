/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import Transport from 'winston-transport';

export class LoggerMemoryTransport extends Transport {
    public items : Record<PropertyKey, any>[] = [];

    log(info: Record<PropertyKey, any>, next: () => void): any {
        this.items.push(info);

        next();
    }
}
