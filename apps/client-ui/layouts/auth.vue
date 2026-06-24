<!--
  - Copyright (c) 2026.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { VCToastProvider } from '@vuecs/overlays';
import { defineNuxtComponent } from '#app';
import { useColorMode } from '#imports';
import NetworkBackground from '../components/auth/NetworkBackground.vue';
import PageFooter from '../components/layout/footer.vue';

export default defineNuxtComponent({
    components: {
        NetworkBackground,
        PageFooter,
        VCToastProvider,
    },
    setup() {
        // Auth entry pages (login, callback) drop the sidebar/header so the
        // network backdrop owns an immersive, full-viewport hero. The shared
        // PageFooter still rides below the fold — it carries the platform links,
        // version, license and "Built with" OSS credits we want on every page.
        // The one in-hero control a logged-out visitor needs — color mode — sits
        // in the corner (a self-contained toggle rather than AAuthGadgets, to
        // keep the login page free of the kit's i18n surface). The footer brings
        // its own <VCToaster>, so this layout only provides the toast context.
        const { isDark } = useColorMode();
        const toggleColorMode = () => {
            isDark.value = !isDark.value;
        };

        return { isDark, toggleColorMode };
    },
});
</script>
<template>
    <VCToastProvider>
        <div class="auth-layout">
            <section class="auth-layout-hero">
                <NetworkBackground
                    :dark="isDark"
                    class="auth-layout-bg"
                />

                <button
                    type="button"
                    class="auth-layout-mode"
                    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
                    :aria-pressed="isDark ? 'true' : 'false'"
                    @click.prevent="toggleColorMode"
                >
                    <VCIcon :name="isDark ? 'fa6-solid:sun' : 'fa6-solid:moon'" />
                </button>

                <main class="auth-layout-content">
                    <NuxtPage />
                </main>
            </section>

            <PageFooter />
        </div>
    </VCToastProvider>
</template>
<style>
.auth-layout {
    position: relative;
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.auth-layout-hero {
    position: relative;
    flex: 1 0 auto;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4rem 1rem;
    overflow: hidden;
    /* Themed backdrop the canvas draws over — flips with the color mode. */
    background:
        radial-gradient(120% 120% at 50% 0%,
            var(--vc-color-bg-muted, #0b1226),
            var(--vc-color-bg, #070b16) 72%);
}

.auth-layout-bg {
    z-index: 0;
}

.auth-layout-content {
    position: relative;
    z-index: 1;
    width: 100%;
}

.auth-layout-mode {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 2;
    width: 2.4rem;
    height: 2.4rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid var(--vc-color-border, rgba(140, 170, 220, 0.25));
    background: color-mix(in srgb, var(--vc-color-bg-elevated, #11182b) 70%, transparent);
    color: var(--vc-color-fg, #e8edf6);
    cursor: pointer;
    backdrop-filter: blur(6px);
    transition: border-color 0.15s ease, color 0.15s ease;
}

.auth-layout-mode:hover {
    border-color: var(--privateaim-brand-teal, #4ecdc4);
    color: var(--privateaim-brand-teal, #4ecdc4);
}
</style>
