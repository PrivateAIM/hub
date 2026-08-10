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
        class="mb-2.5 flex w-full flex-col gap-2.5 rounded-lg border border-border bg-bg-muted p-3.5"
        aria-hidden="true"
    >
        <div class="flex items-center gap-1.5">
            <VCPlaceholder
                size="xs"
                width="16rem"
            />
            <VCPlaceholder
                class="ms-auto"
                size="xs"
                width="6rem"
            />
        </div>
        <div class="flex items-center gap-2.5">
            <VCPlaceholder
                shape="circle"
                width="1.75rem"
            />
            <VCPlaceholder
                size="sm"
                width="11rem"
            />
            <VCPlaceholder
                class="ms-auto"
                size="xs"
                shape="pill"
                width="4.5rem"
            />
        </div>
        <div class="flex items-center gap-1.5 border-t border-border pt-2.5">
            <VCPlaceholder
                size="sm"
                shape="pill"
                width="5.5rem"
            />
            <VCPlaceholder
                size="sm"
                shape="pill"
                width="5rem"
            />
            <VCPlaceholder
                class="ms-auto"
                size="sm"
                width="1.75rem"
            />
        </div>
    </div>
</template>
