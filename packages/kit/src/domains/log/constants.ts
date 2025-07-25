/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum LogLevel {
    /**
     *  indicates that the system is unusable
     *  and requires immediate attention
     */
    EMERGENCE = 'emerg',

    /**
     * indicates that immediate action is necessary
     * to resolve a critical issue.
     */
    ALERT = 'alert',

    /**
     * signifies critical conditions in the program that demand
     * intervention to prevent system failure.
     */
    CRITICAL = 'crit',

    /**
     * indicates error conditions that impair
     * some operation but are less severe than critical situations.
     */
    ERROR = 'error',

    /**
     * signifies potential issues that may lead to errors
     * or unexpected behavior in the future if not addressed.
     */
    WARNING = 'warn',

    /**
     *  applies to normal but significant
     *  conditions that may require monitoring
     */
    NOTICE = 'notice',

    /**
     * includes messages that provide a record
     * of the normal operation of the system.
     */
    INFORMATIONAL = 'info',

    /**
     * intended for logging detailed information about the system
     * for debugging purposes.
     */
    DEBUG = 'debug',
}
