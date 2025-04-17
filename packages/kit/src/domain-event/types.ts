/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type DomainEventFullName<
    DOMAIN extends string,
    EVENT extends string,
> = `${DOMAIN}${Capitalize<EVENT>}`;

export type DomainEventRecord<
    DOMAIN extends string = string,
    EVENT extends string = string,
    DATA extends Record<string, any> = Record<string, any>,
> = {
    type: DOMAIN,
    event: EVENT,
    data: DATA,
};
