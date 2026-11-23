/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TrustProxy } from './types';

const BOOLEAN_TRUE_WORDS = new Set(['true', 't', 'yes', 'y', 'on']);
const BOOLEAN_FALSE_WORDS = new Set(['false', 'f', 'no', 'n', 'off']);

const INTEGER = /^\d+$/;

/**
 * Canonicalize a string-form `TRUST_PROXY` into the shape routup's
 * `trustProxy` app option reads (authup/authup#3339):
 *
 * - an integer is a hop count, and wins over the boolean words: `"1"` means
 *   one trusted hop. Passed through as a string, proxy-addr would read it as
 *   the IPv4 "long value" `0.0.0.1`;
 * - a boolean word trusts every hop (`true`) or none (`false`);
 * - anything else is a comma-separated allowlist of IPs, CIDRs or the
 *   proxy-addr presets (`loopback`, `linklocal`, `uniquelocal`), trimmed
 *   and lowercased per entry, as proxy-addr matches presets case-sensitively.
 */
export function canonicalizeTrustProxy(raw: string): TrustProxy {
    const normalized = raw.trim();

    if (INTEGER.test(normalized)) {
        const hops = Number.parseInt(normalized, 10);

        // parseInt saturates a huge digit string into an unsafe integer or
        // Infinity, which routup reads as "trust every hop".
        if (!Number.isSafeInteger(hops)) {
            throw new Error(`The TRUST_PROXY hop count "${normalized}" exceeds the safe integer range.`);
        }

        return hops;
    }

    const lowered = normalized.toLowerCase();

    if (BOOLEAN_TRUE_WORDS.has(lowered)) {
        return true;
    }

    if (BOOLEAN_FALSE_WORDS.has(lowered)) {
        return false;
    }

    return lowered
        .split(',')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
}
