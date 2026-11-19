/*
 * Copyright (c) 2023-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasUnboundedReach } from '@authup/access';
import { ErrorCode as AuthupErrorCode } from '@authup/errors';
import { ErrorCode, HubError } from '@privateaim/errors';
import { PermissionName } from '@privateaim/kit';
import { rateLimit } from '@routup/rate-limit';
import type { App, IAppEvent } from 'routup';
import { defineCoreHandler, getRequestIP } from 'routup';
import { useRequestEnv, useRequestIdentity } from '../request';

const PERMISSION_NAMES = Object.values(PermissionName);

const WINDOW_MS = 60 * 1000;

/**
 * Failed authentications one source address may cause per window before
 * authentication is known (authup/authup#3692).
 */
export const RATE_LIMIT_FAILED_AUTHENTICATION_MAX = 300;

/**
 * Requests per window once the caller is known; an anonymous request is
 * counted against its address.
 */
export const RATE_LIMIT_BUDGETS = {
    anonymous: 60 * 20,
    user: 60 * 100,
    client: 60 * 1000,
} as const;

// A proxy may append the client's source port, which changes per connection.
function stripPort(ip: string): string {
    return ip.match(/^\[([^\]]+)\]:\d+$/)?.[1] ??
        ip.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/)?.[1] ??
        ip;
}

/**
 * The plugin's default key hardcodes `trustProxy: true`; this one follows the
 * app's TRUST_PROXY. Prefixed, as the key indexes a plain object.
 */
function buildAddressKey(event: IAppEvent): string {
    return `ip:${stripPort(getRequestIP(event) || '127.0.0.1')}`;
}

/**
 * A 401 for a credential that could have been guessed. An expired or revoked
 * token carries a valid signature, and a request without a credential guessed
 * nothing; both are what users behind one NAT address cause in ordinary use.
 */
function isFailedAuthentication(event: IAppEvent, response: Response): boolean {
    if (response.status !== 401) {
        return false;
    }

    const code = useRequestEnv(event, 'errorCode');

    if (code === AuthupErrorCode.JWT_EXPIRED || code === AuthupErrorCode.JWT_INACTIVE) {
        return false;
    }

    return !!event.headers.get('authorization');
}

/**
 * Hub's own service clients (e.g. the worker's `system` client) are never
 * throttled: a client whose grants reach every realm for EVERY hub
 * permission. One name per call, as several names compile as any-of.
 */
async function isServiceClient(event: IAppEvent): Promise<boolean> {
    const identity = useRequestIdentity(event);
    const permissionEvaluator = useRequestEnv(event, 'permissionEvaluator');

    if (!identity || identity.type !== 'client' || !permissionEvaluator) {
        return false;
    }

    const verdicts = await Promise.all(PERMISSION_NAMES.map(
        (name) => hasUnboundedReach(permissionEvaluator, name),
    ));

    return verdicts.every(Boolean);
}

type FailedAuthenticationWindow = {
    count: number,
    resetAt: number,
};

/**
 * First stage, BEFORE authorization: counts failed authentications per
 * source address, so a flood of forged bearers is cut before it reaches
 * Authup introspection.
 *
 * A request is counted only once its response is a failed authentication;
 * valid, expired-token and still pending requests never use the budget, so
 * long-polls and uploads from one address cannot exhaust it. The limit is
 * checked before forwarding, so one parallel burst can overshoot it once
 * before it closes. Counters live per replica, in fixed windows.
 */
export function mountAuthenticationRateLimiterMiddleware(app: App) {
    const windows = new Map<string, FailedAuthenticationWindow>();
    let nextSweepAt = Date.now() + WINDOW_MS;

    const sweep = (now: number) => {
        if (now < nextSweepAt) {
            return;
        }

        nextSweepAt = now + WINDOW_MS;

        for (const [key, window] of windows) {
            if (window.resetAt <= now) {
                windows.delete(key);
            }
        }
    };

    app.use(defineCoreHandler(async (event) => {
        const key = buildAddressKey(event);
        const now = Date.now();

        sweep(now);

        const window = windows.get(key);

        if (window && window.resetAt > now && window.count >= RATE_LIMIT_FAILED_AUTHENTICATION_MAX) {
            event.response.headers.set('retry-after', `${Math.ceil((window.resetAt - now) / 1000)}`);

            throw new HubError({
                code: ErrorCode.THROTTLED,
                status: 429,
                message: 'Too many failed authentications, please try again later.',
            });
        }

        const response = await event.next();

        if (response && isFailedAuthentication(event, response)) {
            const finishedAt = Date.now();
            const current = windows.get(key);

            if (current && current.resetAt > finishedAt) {
                current.count += 1;
            } else {
                windows.set(key, { count: 1, resetAt: finishedAt + WINDOW_MS });
            }
        }

        return response;
    }));
}

/**
 * Second stage, AFTER authorization: an authenticated request counts against
 * its identity, so users sharing an address no longer share a budget; an
 * anonymous one against its address.
 */
export function mountRateLimiterMiddleware(app: App) {
    app.use(rateLimit({
        keyGenerator: (event) => {
            const identity = useRequestIdentity(event);

            if (identity) {
                return `${identity.type}:${identity.id}`;
            }

            return buildAddressKey(event);
        },
        skip: isServiceClient,
        max(event: IAppEvent) {
            const identity = useRequestIdentity(event);

            if (!identity) {
                return RATE_LIMIT_BUDGETS.anonymous;
            }

            return identity.type === 'client' ? RATE_LIMIT_BUDGETS.client : RATE_LIMIT_BUDGETS.user;
        },
        windowMs: WINDOW_MS,
    }));
}
