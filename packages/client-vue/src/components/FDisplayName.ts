/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType } from 'vue';
import { computed, defineComponent, h } from 'vue';
import { hasNormalizedSlot, normalizeSlot } from '../core';

/**
 * Render an entity's human-readable label: the `display-name` when set, falling
 * back to the (URL-friendly) `name`. Read-only and entity-agnostic.
 *
 * The default slot receives `{ name, displayName, display }` so callers can wrap
 * the resolved label (e.g. in a link or with an icon).
 */
export default defineComponent({
    props: {
        name: {
            type: String as PropType<string | null | undefined>,
            default: undefined,
        },
        displayName: {
            type: String as PropType<string | null | undefined>,
            default: undefined,
        },
    },
    setup(props, { slots }) {
        const display = computed(() => props.displayName || props.name || '');

        return () => {
            if (hasNormalizedSlot('default', slots)) {
                return normalizeSlot('default', {
                    name: props.name,
                    displayName: props.displayName,
                    display: display.value,
                }, slots);
            }

            return h('span', [display.value]);
        };
    },
});
