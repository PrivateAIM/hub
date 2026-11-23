/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type AnalysisStorageTokenCreatePayload = {
    /**
     * Capability entries (type:id:actions), all belonging to one analysis.
     */
    cap: string[],
    /**
     * Token lifetime in seconds (max 3600).
     */
    lifetime?: number
};

export type AnalysisStorageToken = {
    token: string,
    /**
     * ISO timestamp.
     */
    expiresAt: string
};
