<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { BToastOrchestrator } from 'bootstrap-vue-next';
import { defineComponent } from 'vue';

export default defineComponent({
    components: { BToastOrchestrator },
    data() {
        return {
            startYear: 2024,
        };
    },
    computed: {
        year() {
            const year = new Date().getFullYear();

            return year === this.startYear ? year : `${this.startYear}-${year}`;
        },
    },
});
</script>
<template>
    <div>
        <div class="page-footer">
            <div class="copyright">
                &copy; {{ year }}
                <a href="https://privateaim.de">PrivateAim</a>
            </div>
        </div>
        <BToastOrchestrator />
    </div>
</template>
