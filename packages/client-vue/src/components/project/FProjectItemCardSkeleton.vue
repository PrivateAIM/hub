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
        class="flex h-full w-full flex-col gap-3 rounded-lg border border-border bg-bg-elevated p-4"
        aria-hidden="true"
    >
        <div class="flex items-start gap-2.5">
            <VCPlaceholder
                shape="circle"
                width="2.25rem"
            />
            <div class="flex flex-1 flex-col gap-1.5">
                <VCPlaceholder
                    size="sm"
                    width="70%"
                />
                <VCPlaceholder
                    size="xs"
                    width="45%"
                />
            </div>
        </div>
        <VCPlaceholder
            size="xs"
            width="90%"
        />
        <div class="flex items-center gap-2.5">
            <VCPlaceholder
                size="xs"
                width="2.5rem"
            />
            <VCPlaceholder
                size="xs"
                shape="pill"
                width="40%"
            />
            <VCPlaceholder
                size="xs"
                width="30%"
            />
        </div>
        <div class="mt-auto flex items-center gap-1.5 pt-1">
            <VCPlaceholder
                size="sm"
                shape="pill"
                width="5rem"
            />
            <VCPlaceholder
                size="sm"
                shape="pill"
                width="6rem"
            />
            <VCPlaceholder
                size="sm"
                shape="pill"
                width="5rem"
            />
            <VCPlaceholder
                class="ms-auto"
                size="xs"
                width="2.5rem"
            />
        </div>
    </div>
</template>
