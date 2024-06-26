<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { AIdentityProviders, injectHTTPClient } from '@authup/client-web-kit';
import {
    FPagination, FSearch, FTitle, LoginForm,
} from '@privateaim/client-vue';
import {
    definePageMeta,
    navigateTo,
    useRoute,
    useToast,
} from '#imports';
import {
    defineNuxtComponent,
} from '#app';
import MedicineWorker from '../components/svg/MedicineWorker';
import { LayoutKey, LayoutNavigationID } from '../config/layout';

export default defineNuxtComponent({
    components: {
        LoginForm,
        ListPagination: FPagination,
        ListSearch: FSearch,
        ListTitle: FTitle,
        AIdentityProviders,
        MedicineWorker,
    },
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_OUT]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        });

        const toast = useToast();
        const route = useRoute();
        const apiClient = injectHTTPClient();

        const handleDone = () => {
            const { redirect, ...query } = route.query;

            navigateTo({
                path: (redirect || '/') as string,
                query,
            });
        };

        const handleFailed = (e: Error) => {
            if (toast) {
                toast.show({ variant: 'warning', body: e.message });
            }
        };

        const buildIdentityProviderURL = (id: string) => apiClient.identityProvider.getAuthorizeUri(
            apiClient.getBaseURL() as string,
            id,
        );

        return {
            handleDone,
            handleFailed,
            buildIdentityProviderURL,
        };
    },
});
</script>
<template>
    <div class="container">
        <h4>
            <i class="fa-solid fa-arrow-right-to-bracket pe-2" />
            Login
        </h4>
        <div class="text-center">
            <MedicineWorker :height="320" />
        </div>

        <div class="row">
            <div class="col-6">
                <LoginForm
                    @done="handleDone"
                    @failed="handleFailed"
                />
            </div>
            <div class="col-6">
                <AIdentityProviders>
                    <template #header="props">
                        <ListTitle
                            text="Providers"
                            icon-class="fa-solid fa-atom"
                        />
                        <ListSearch
                            :load="props.load"
                            :meta="props.meta"
                        />
                    </template>
                    <template #footer="props">
                        <ListPagination
                            :load="props.load"
                            :meta="props.meta"
                        />
                    </template>
                    <template #item="props">
                        <div>
                            <strong>{{ props.data.name }}</strong>
                        </div>
                        <div class="ms-auto">
                            <a
                                :href="buildIdentityProviderURL(props.data.id)"
                                class="btn btn-primary btn-xs"
                            >
                                {{ props.data.name }}
                            </a>
                        </div>
                    </template>
                </AIdentityProviders>
            </div>
        </div>
    </div>
</template>
