<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { BModalOrchestrator, BToastOrchestrator } from 'bootstrap-vue-next';
import { computed, defineComponent } from 'vue';
import { useRuntimeConfig } from '#imports';

export default defineComponent({
    components: {
        BModalOrchestrator,
        BToastOrchestrator,
    },
    setup() {
        const runtimeConfig = useRuntimeConfig();

        const startYear = 2024;
        const year = computed(() => {
            const year = new Date().getFullYear();

            return year === startYear ? year : `${startYear}-${year}`;
        });

        const version = computed(() => {
            if (runtimeConfig.public.version) {
                return `v${runtimeConfig.public.version}`;
            }

            return 'v0.0.0';
        });

        return {
            year,
            version,
        };
    },
});
</script>
<template>
    <div>
        <div class="page-footer">
            <div>
                {{ version }}
            </div>
            <div>
                <a href="https://privateaim.de">PrivateAim</a>
            </div>
            <div>
                &copy; {{ year }}
            </div>
        </div>
        <BToastOrchestrator />
        <BModalOrchestrator />
    </div>
</template>
<style>
.page-footer {
    display: flex;
    flex-direction: row;
    box-shadow: 0px 6px 0px 0px rgba(0, 0, 0, 0.3) inset;
    background-color: #40434E;
    padding: 10px 0px 4px 0px;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: #aeb2b7;
    gap: 0.5rem;
    line-height: 1.25rem;
}

.page-footer > div:not(:first-child):before {
    padding-right: 0.5rem;
    content: '-';
    width:1.5em;
    height:1.5em;
}

.page-footer a {
    color:#FF5B5B;
    text-decoration: none;
}

</style>
