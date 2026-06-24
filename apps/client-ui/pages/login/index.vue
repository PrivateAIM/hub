<!--
  - Copyright (c) 2021-2026.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Realm } from '@authup/core-kit';
import { CLIENT_WEB_NAME } from '@authup/core-kit';
import {
    ARealmGrid,
    buildAuthorizeURL,
    createPKCE,
    createState,
    injectHTTPClient,
    saveAuthorizationRequest,
} from '@authup/client-web-kit';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { defineNuxtComponent, useRuntimeConfig } from '#app';
import { definePageMeta, useToast } from '#imports';
import Logo from '../../components/svg/Logo';
import { LayoutKey } from '../../config/layout';

export default defineNuxtComponent({
    components: {
        ARealmGrid,
        Logo,
    },
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_OUT]: true,
            layout: 'auth',
        });

        const route = useRoute();
        const toast = useToast();
        const runtimeConfig = useRuntimeConfig();
        const apiClient = injectHTTPClient();

        // Configurable per deployment (AUTHUP_CLIENT_ID); defaults to the
        // Authup built-in "web" client. The client must register
        // `<ui-origin>/login/callback` as a redirect URI.
        const clientId = (runtimeConfig.public.authupClientId as string) || CLIENT_WEB_NAME;

        const realmGrid = ref<{ reset: () => void } | null>(null);

        const handleSelect = async (realm: Realm) => {
            try {
                const pkce = await createPKCE();
                const state = createState();

                const redirectUri = `${window.location.origin}/login/callback`;

                // Preserve the post-login destination AND any sibling query
                // params on the login URL (e.g. /login?redirect=/projects&x=1
                // → /projects?x=1).
                const { redirect, ...rest } = route.query;
                let target: string | undefined;
                if (typeof redirect === 'string') {
                    const url = new URL(redirect, window.location.origin);
                    for (const [key, value] of Object.entries(rest)) {
                        if (Array.isArray(value)) {
                            for (const entry of value) {
                                if (entry != null) {
                                    url.searchParams.append(key, entry);
                                }
                            }
                        } else if (value != null) {
                            url.searchParams.set(key, value);
                        }
                    }
                    target = `${url.pathname}${url.search}${url.hash}`;
                }

                saveAuthorizationRequest({
                    state,
                    code_verifier: pkce.code_verifier,
                    redirect_uri: redirectUri,
                    client_id: clientId,
                    realm_id: realm.id,
                    target,
                });

                window.location.href = buildAuthorizeURL({
                    baseURL: apiClient.getBaseURL() as string,
                    clientId,
                    realmId: realm.id,
                    redirectUri,
                    scope: 'global openid',
                    state,
                    codeChallenge: pkce.code_challenge,
                    codeChallengeMethod: pkce.code_challenge_method,
                });
            } catch (e) {
                // Drop the grid's auto-select skeleton so the user isn't
                // stranded when the redirect glue fails.
                realmGrid.value?.reset();
                if (toast) {
                    toast.show({
                        variant: 'warning',
                        body: e instanceof Error ? e.message : 'The login could not be started.',
                    });
                }
            }
        };

        return {
            handleSelect,
            realmGrid,
        };
    },
});
</script>
<template>
    <div class="login-entry">
        <div class="login-hero">
            <Logo :height="56" />
            <h1 class="login-title">
                FLAME Hub
            </h1>
            <p class="login-subtitle">
                Select your realm to continue
            </p>
        </div>

        <div class="login-realms">
            <ARealmGrid
                ref="realmGrid"
                @select="handleSelect"
            />
        </div>
    </div>
</template>
<style scoped>
.login-entry {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
}

.login-hero {
    /* Tailwind preflight makes the <img> (Logo) display:block, so text-align
       alone won't center it — lay the hero out as a centered column. */
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 2rem;
}

.login-title {
    margin-top: 0.75rem;
    font-weight: 800;
    font-size: 2rem;
    letter-spacing: 0.3px;
}

.login-subtitle {
    margin-top: 0.25rem;
    color: var(--vc-color-fg-muted, #9aa6bd);
}

/* Cap the picker height so a many-realm deployment (production runs 26+)
   scrolls inside the card instead of pushing the page past the viewport.
   ARealmGrid reveals its own search field past 8 realms to narrow the list. */
.login-realms {
    max-height: 52vh;
    overflow-y: auto;
    padding: 0.25rem;
}

/* Keep ARealmGrid's search pinned to the top of the scroll area so it stays
   reachable while browsing 26+ realms instead of scrolling out of view. The
   blurred backdrop hides tiles passing underneath. */
.login-realms :deep(.a-realm-search) {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 0.35rem 0.25rem 0.6rem;
    background: color-mix(in srgb, var(--vc-color-bg, #070b16) 82%, transparent);
    backdrop-filter: blur(8px);
}
</style>
