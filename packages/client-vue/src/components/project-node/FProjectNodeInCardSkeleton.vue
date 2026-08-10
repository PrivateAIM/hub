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
        class="mb-2.5 flex w-full flex-row gap-5 rounded-lg border border-border bg-bg-muted p-3.5"
        aria-hidden="true"
    >
        <div class="flex flex-1 flex-col gap-2.5">
            <VCPlaceholder
                size="xs"
                width="18rem"
            />
            <div class="flex items-center gap-2.5">
                <VCPlaceholder
                    shape="circle"
                    width="2rem"
                />
                <VCPlaceholder
                    size="sm"
                    width="11rem"
                />
            </div>
            <VCPlaceholder
                size="xs"
                width="85%"
            />
            <div class="mt-auto flex items-center gap-1.5">
                <VCPlaceholder
                    size="sm"
                    shape="pill"
                    width="6rem"
                />
                <VCPlaceholder
                    size="sm"
                    shape="pill"
                    width="6rem"
                />
                <VCPlaceholder
                    size="sm"
                    shape="pill"
                    width="7rem"
                />
            </div>
        </div>
        <div class="flex w-40 flex-none flex-col gap-2 border-s border-border ps-4">
            <VCPlaceholder
                size="xs"
                shape="pill"
                width="4rem"
            />
            <VCPlaceholder
                size="sm"
                width="100%"
            />
            <VCPlaceholder
                size="sm"
                width="100%"
            />
            <VCPlaceholder
                class="mt-auto"
                size="xs"
                width="80%"
            />
        </div>
    </div>
</template>
