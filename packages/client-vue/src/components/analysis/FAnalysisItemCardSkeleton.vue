<!--
  - Copyright (c) 2026.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { VCPlaceholder } from '@vuecs/placeholder';
import { defineComponent } from 'vue';

export default defineComponent({ components: { VCPlaceholder } });
</script>
<template>
    <div
        class="mb-2.5 flex w-full flex-col gap-3 rounded-lg border border-border bg-bg-muted p-3.5"
        aria-hidden="true"
    >
        <div class="flex items-center gap-2.5">
            <VCPlaceholder
                shape="circle"
                width="1.75rem"
            />
            <VCPlaceholder
                size="sm"
                width="10rem"
            />
            <VCPlaceholder
                size="xs"
                shape="pill"
                width="6rem"
            />
            <VCPlaceholder
                class="ms-auto"
                size="xs"
                width="5rem"
            />
        </div>
        <div class="flex items-start justify-between px-1">
            <div
                v-for="stage in 5"
                :key="stage"
                class="flex w-24 flex-col items-center gap-1.5"
            >
                <VCPlaceholder
                    shape="circle"
                    width="1.5rem"
                />
                <VCPlaceholder
                    size="xs"
                    width="70%"
                />
                <VCPlaceholder
                    size="xs"
                    width="50%"
                />
            </div>
        </div>
        <div class="flex flex-col gap-1.5 border-t border-border pt-2">
            <VCPlaceholder
                v-for="lane in 3"
                :key="lane"
                size="sm"
                :width="lane === 2 ? '92%' : '100%'"
            />
        </div>
    </div>
</template>
