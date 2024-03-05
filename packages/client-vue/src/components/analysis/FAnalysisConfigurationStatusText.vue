<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<template>
    <span>
        <slot
            :class-suffix="classSuffix"
            :status-text="statusText"
        >
            <span :class="'text-'+classSuffix"> {{ statusText }}</span>
        </slot>
    </span>
</template>
<script lang="ts">
import { AnalysisConfigurationStatus } from '@privateaim/core';
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        status: {
            type: String,
            default: null,
        },
    },
    computed: {
        statusText() {
            switch (this.status) {
                case AnalysisConfigurationStatus.BASE_CONFIGURED:
                    return 'base configured';
                case AnalysisConfigurationStatus.SECURITY_CONFIGURED:
                    return 'security configured';
                case AnalysisConfigurationStatus.RESOURCE_CONFIGURED:
                    return 'files uploaded';
                case AnalysisConfigurationStatus.HASH_GENERATED:
                    return 'hash generated';
                case AnalysisConfigurationStatus.HASH_SIGNED:
                    return 'hash signed';
                case AnalysisConfigurationStatus.FINISHED:
                    return 'finished';
                default:
                    return 'none';
            }
        },
        classSuffix() {
            switch (this.status) {
                case AnalysisConfigurationStatus.BASE_CONFIGURED:
                case AnalysisConfigurationStatus.SECURITY_CONFIGURED:
                case AnalysisConfigurationStatus.RESOURCE_CONFIGURED:
                case AnalysisConfigurationStatus.HASH_SIGNED:
                case AnalysisConfigurationStatus.HASH_GENERATED:
                    return 'primary';
                case AnalysisConfigurationStatus.FINISHED:
                    return 'success';
                default:
                    return 'info';
            }
        },
        iconClass() {
            switch (this.status) {
                case AnalysisConfigurationStatus.BASE_CONFIGURED:
                    return 'fas fa-cog';
                case AnalysisConfigurationStatus.SECURITY_CONFIGURED:
                    return 'fa fa-key';
                case AnalysisConfigurationStatus.RESOURCE_CONFIGURED:
                    return 'fa fa-clone';
                case AnalysisConfigurationStatus.HASH_GENERATED:
                    return 'fa fa-signature';
                case AnalysisConfigurationStatus.HASH_SIGNED:
                    return 'fa fa-signature';
                case AnalysisConfigurationStatus.FINISHED:
                    return 'fa fa-sign';
                default:
                    return '';
            }
        },
    },
});
</script>
