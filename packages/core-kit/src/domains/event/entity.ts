/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export interface Event {
    id: string;

    /**
     * domaine
     *
     * eg. analysis, node, analysisNode, ....
     */
    ref_type: string;

    /**
     * eg. uuid
     */
    ref_id: string | null;

    /**
     * component, prozess,
     *
     * eg. build, push, modelChanges, ...
     */
    scope: string;

    /**
     * eg. started, starting, finished, ...
     */
    name: string;

    /**
     *
     * { description: { new_value: "xxx", prev_value: "yyy" }, name {}}
     */
    data: Record<string, any>;

    /**
     * default: false
     */
    expiring: boolean;

    // ------------------------------------------------------------------

    actor_type: string | null;

    actor_id: string | null;

    actor_name: string | null;

    actor_ip_address: string | null;

    // ------------------------------------------------------------------

    expires_at: string | null;

    created_at: string;

    updated_at: string;
}
