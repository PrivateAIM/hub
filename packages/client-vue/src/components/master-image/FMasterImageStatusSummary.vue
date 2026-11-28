<!--
  - Copyright (c) 2026.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { isServerRuntime } from '@authup/client-web-kit';
import type { PropType } from 'vue';
import { defineComponent, ref } from 'vue';
import { injectCoreHTTPClient } from '../../core';
import { MasterImageStatusFilter } from './constants';
import { buildMasterImageStatusFilters } from './utils';

type Tile = {
    key: `${MasterImageStatusFilter}`,
    label: string,
    colorClass: string,
};

const TILES: Tile[] = [
    {
        key: MasterImageStatusFilter.ALL, 
        label: 'Images', 
        colorClass: 'text-fg', 
    },
    {
        key: MasterImageStatusFilter.BUILT, 
        label: 'Built', 
        colorClass: 'text-success-600', 
    },
    {
        key: MasterImageStatusFilter.BUILDING, 
        label: 'Building', 
        colorClass: 'text-info-600', 
    },
    {
        key: MasterImageStatusFilter.FAILED, 
        label: 'Failed', 
        colorClass: 'text-error-600', 
    },
];

/**
 * Counts of master images per build status, one `limit: 1` request per tile
 * read through `meta.total`. A tile is a button: selecting it emits the
 * status filter, so the page can narrow its list to that bucket.
 */
export default defineComponent({
    props: {
        modelValue: {
            type: String as PropType<`${MasterImageStatusFilter}`>,
            default: MasterImageStatusFilter.ALL,
        },
    },
    emits: ['update:modelValue'],
    setup(_props, { expose }) {
        const client = injectCoreHTTPClient();

        const counts = ref<Partial<Record<`${MasterImageStatusFilter}`, number>>>({});
        const busy = ref(false);

        const reload = async () => {
            busy.value = true;

            try {
                const totals = await Promise.all(TILES.map(async (tile) => {
                    const filters = buildMasterImageStatusFilters(tile.key);
                    const response = await client.masterImage.getMany({
                        ...(filters ? { filters } : {}),
                        fields: ['id'],
                        pagination: { limit: 1 },
                    });

                    return [tile.key, response.meta.total] as const;
                }));

                counts.value = Object.fromEntries(totals);
            } finally {
                busy.value = false;
            }
        };

        expose({ reload });

        // Upstream: authup/authup#3924 (client only until a late server-render refresh is safe)
        // The server render does not await this fetch, so its result never
        // reached the HTML; a 401 on it refreshed the session after the
        // response was sent and spent the refresh token.
        if (!isServerRuntime()) {
            Promise.resolve().then(() => reload());
        }

        return {
            busy,
            counts,
            tiles: TILES,
            reload,
        };
    },
});
</script>
<template>
    <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
            v-for="tile in tiles"
            :key="tile.key"
            type="button"
            class="flex cursor-pointer flex-col items-start rounded-md border px-3 py-2 text-left transition-colors"
            :class="modelValue === tile.key ?
                'border-primary-600 bg-bg-muted' :
                'border-border bg-bg hover:bg-bg-muted'"
            :aria-pressed="modelValue === tile.key"
            :data-status="tile.key"
            @click="$emit('update:modelValue', tile.key)"
        >
            <span
                class="text-2xl font-bold tabular-nums"
                :class="tile.colorClass"
            >
                {{ typeof counts[tile.key] === 'number' ? counts[tile.key] : '–' }}
            </span>
            <span class="text-xs uppercase tracking-wide text-fg-muted">{{ tile.label }}</span>
        </button>
    </div>
</template>
