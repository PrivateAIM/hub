<!--
  - Copyright (c) 2026.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { VCIcon } from '@vuecs/icon';
import { defineComponent } from 'vue';
import { TOOLS } from '../../config/tools';
import Logo from '../svg/Logo';

export default defineComponent({
    components: { Logo, VCIcon },
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        version: {
            type: String,
            default: '',
        },
    },
    emits: ['update:modelValue'],
    setup() {
        return { tools: TOOLS };
    },
});
</script>
<template>
    <VCModal
        :open="modelValue"
        @update:open="$emit('update:modelValue', $event)"
    >
        <VCModalContent class="modal-md">
            <div class="modal-header">
                <h6 class="mb-0">
                    About
                </h6>
                <VCModalClose class="btn-close" />
            </div>
            <div class="modal-body about-modal-body">
                <div class="about-modal-brand">
                    <Logo :height="40" />
                    <div>
                        <div class="about-modal-title">
                            FLAME Hub
                        </div>
                        <div class="about-modal-version">
                            {{ version }}
                        </div>
                    </div>
                </div>
                <p>
                    Central services for the FLAME platform, a privacy-preserving
                    analytics infrastructure for federated data analysis across
                    distributed institutions.
                </p>
                <p>
                    Released under the
                    <a
                        href="https://github.com/PrivateAIM/hub/blob/master/LICENSE"
                        target="_blank"
                        rel="noopener"
                    >Apache-2.0 license</a>.
                    The source code is available on
                    <a
                        href="https://github.com/PrivateAIM/hub"
                        target="_blank"
                        rel="noopener"
                    >GitHub</a>.
                </p>
                <div class="about-modal-heading">
                    Development
                </div>
                <p>
                    Created and maintained by
                    <a
                        href="https://tada5hi.net"
                        target="_blank"
                        rel="noopener"
                    >Peter Placzek</a>
                    (<a
                        href="https://github.com/tada5hi"
                        target="_blank"
                        rel="noopener"
                    >@tada5hi</a>), with contributions from the
                    <a
                        href="https://github.com/PrivateAIM/hub/graphs/contributors"
                        target="_blank"
                        rel="noopener"
                    >PrivateAIM team</a>.
                </p>
                <div class="about-modal-heading">
                    Built with open source
                </div>
                <ul class="about-modal-tools">
                    <li
                        v-for="tool in tools"
                        :key="tool.name"
                    >
                        <a
                            :href="tool.website"
                            target="_blank"
                            rel="noopener"
                        >{{ tool.name }}</a>
                        <a
                            :href="tool.repository"
                            target="_blank"
                            rel="noopener"
                            class="about-modal-tool-repository"
                            :aria-label="`${tool.name} on GitHub`"
                        ><VCIcon name="fa6-brands:github" /></a>
                        - {{ tool.description }}
                    </li>
                </ul>
            </div>
        </VCModalContent>
    </VCModal>
</template>
<style>
.about-modal-body p {
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
}

.about-modal-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
}

.about-modal-title {
    font-weight: 600;
}

.about-modal-version {
    font-size: 0.875rem;
    color: var(--privateaim-chrome-fg-muted);
}

.about-modal-heading {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
}

.about-modal-tools {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    font-size: 0.875rem;
}

.about-modal-body a {
    color: var(--privateaim-brand-coral);
    text-decoration: none;
}

.about-modal-body a.about-modal-tool-repository {
    display: inline-flex;
    align-items: center;
    margin-left: 0.25rem;
    vertical-align: text-bottom;
    color: var(--privateaim-chrome-fg-muted);
}

.about-modal-body a.about-modal-tool-repository:hover {
    color: var(--privateaim-brand-coral);
}

.about-modal-body a:hover {
    text-decoration: underline;
}
</style>
