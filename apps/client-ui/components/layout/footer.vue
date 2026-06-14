<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { VCToaster } from '@vuecs/overlays';
import { computed, defineComponent, ref } from 'vue';
import { useRuntimeConfig } from '#imports';
import { TOOLS } from '../../config/tools';
import Logo from '../svg/Logo';
import AboutModal from './about-modal.vue';

export default defineComponent({
    components: {
        AboutModal, 
        Logo, 
        VCToaster, 
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

        const aboutVisible = ref(false);

        return {
            year,
            version,
            aboutVisible,
            tools: TOOLS,
        };
    },
});
</script>
<template>
    <div>
        <footer class="page-footer">
            <div class="page-footer-main">
                <div class="page-footer-brand">
                    <div class="page-footer-brand-title">
                        <Logo :height="24" />
                        <span>FLAME Hub</span>
                    </div>
                    <p>
                        Privacy-preserving analytics infrastructure for federated
                        data analysis across distributed institutions.
                    </p>
                    <button
                        type="button"
                        class="page-footer-about"
                        @click="aboutVisible = true"
                    >
                        About this application
                    </button>
                </div>
                <div>
                    <div class="page-footer-heading">
                        Platform
                    </div>
                    <ul class="page-footer-links">
                        <li>
                            <a
                                href="https://privateaim.de"
                                target="_blank"
                                rel="noopener"
                            >Homepage</a>
                        </li>
                        <li>
                            <a
                                href="https://docs.privateaim.net"
                                target="_blank"
                                rel="noopener"
                            >Documentation</a>
                        </li>
                        <li>
                            <a
                                href="https://github.com/PrivateAIM/hub"
                                target="_blank"
                                rel="noopener"
                            >GitHub</a>
                        </li>
                    </ul>
                </div>
                <div>
                    <div class="page-footer-heading">
                        Built with
                    </div>
                    <ul class="page-footer-links">
                        <li
                            v-for="tool in tools"
                            :key="tool.name"
                            class="page-footer-tool"
                        >
                            <span>{{ tool.name }}</span>
                            <a
                                :href="tool.website"
                                target="_blank"
                                rel="noopener"
                                :aria-label="`${tool.name} documentation`"
                            ><VCIcon name="fa6-solid:book" /></a>
                            <a
                                :href="tool.repository"
                                target="_blank"
                                rel="noopener"
                                :aria-label="`${tool.name} on GitHub`"
                            ><VCIcon name="fa6-brands:github" /></a>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="page-footer-bottom">
                <div>
                    &copy; {{ year }} PrivateAIM
                </div>
                <div>
                    {{ version }}
                </div>
                <div>
                    <a
                        href="https://github.com/PrivateAIM/hub/blob/master/LICENSE"
                        target="_blank"
                        rel="noopener"
                    >Apache-2.0</a>
                </div>
            </div>
        </footer>
        <AboutModal
            v-model="aboutVisible"
            :version="version"
        />
        <VCToaster position="top-center" />
    </div>
</template>
<style>
.page-footer {
    box-shadow: var(--privateaim-chrome-edge-shadow-top);
    background-color: var(--privateaim-chrome-bg);
    /* Lift above `.page-content` (positioned, own background) so the
       outset edge shadow paints over the content surface. */
    position: relative;
    z-index: 1;
    color: var(--privateaim-chrome-fg-muted);
    line-height: 1.5;
}

.page-footer a {
    color: var(--privateaim-brand-coral);
    text-decoration: none;
}

.page-footer a:hover {
    text-decoration: underline;
}

.page-footer-main {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    max-width: 72rem;
    margin: 0 auto;
    padding: 1.5rem 1.5rem 1.25rem 1.5rem;
}

@media (min-width: 768px) {
    .page-footer-main {
        grid-template-columns: 2fr 1fr 1fr;
        gap: 2rem;
    }
}

.page-footer-brand {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    max-width: 28rem;
}

.page-footer-brand-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: var(--privateaim-chrome-fg);
}

.page-footer-brand p {
    margin: 0;
    font-size: 0.875rem;
}

.page-footer-about {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font: inherit;
    font-size: 0.875rem;
    color: var(--privateaim-brand-coral);
}

.page-footer-about:hover {
    text-decoration: underline;
}

.page-footer-heading {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
    color: var(--privateaim-chrome-fg);
}

.page-footer-links {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.875rem;
}

.page-footer-tool {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
}

.page-footer-tool a {
    display: inline-flex;
    align-items: center;
    color: var(--privateaim-chrome-fg-muted);
}

.page-footer-tool a:hover {
    color: var(--privateaim-brand-coral);
}

.page-footer-bottom {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    border-top: 1px solid var(--privateaim-chrome-border);
    font-size: 0.875rem;
}

.page-footer-bottom > div:not(:first-child):before {
    padding-right: 0.5rem;
    content: '·';
}
</style>
