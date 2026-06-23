<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Node } from '@privateaim/core-kit';
import { useClipboard } from '@vueuse/core';
import {
    type PropType,
    defineComponent,
    onMounted,
    ref,
    watch,
} from 'vue';
import { injectCoreHTTPClient } from '../../core';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<Node>,
            required: true,
        },
    },
    emits: ['failed'],
    setup(props, { emit }) {
        const httpClient = injectCoreHTTPClient();
        const clipboard = useClipboard();

        const host = ref<string | null>(null);
        const externalName = ref<string | null>(null);
        const accountName = ref<string | null>(null);
        const accountSecret = ref<string | null>(null);
        const revealed = ref(false);
        const busy = ref(false);
        const loaded = ref(false);

        const load = async () => {
            if (busy.value) {
                return;
            }

            // Reset so a previous node's credentials never linger while the
            // current one is (re)loaded — important because the parent reuses
            // this component across node ids.
            revealed.value = false;
            host.value = null;
            externalName.value = null;
            accountName.value = null;
            accountSecret.value = null;

            if (!props.entity.registry_project_id) {
                loaded.value = true;
                return;
            }

            busy.value = true;
            try {
                const credentials = await httpClient.node.getRegistryCredentials(props.entity.id);
                host.value = credentials.host;
                externalName.value = credentials.external_name;
                accountName.value = credentials.account_name;
                accountSecret.value = credentials.account_secret;
            } catch (e) {
                emit('failed', e);
            } finally {
                busy.value = false;
                loaded.value = true;
            }
        };

        onMounted(load);
        watch(() => props.entity.id, load);

        const copy = (value: string | null) => {
            if (!value) {
                return;
            }

            clipboard.copy(value);
        };

        const toggleReveal = () => {
            revealed.value = !revealed.value;
        };

        return {
            busy,
            loaded,
            host,
            externalName,
            accountName,
            accountSecret,
            revealed,
            copy,
            toggleReveal,
        };
    },
});
</script>
<template>
    <div>
        <h6>Registry Credentials</h6>

        <p>
            These credentials let the node authenticate against the docker registry of its
            registry project (robot account). Keep the secret confidential.
        </p>

        <div
            v-if="!entity.registry_project_id"
            class="alert alert-sm alert-warning"
        >
            The node has no registry project provisioned yet.
        </div>
        <div
            v-else-if="busy || !loaded"
            class="flex flex-row items-center gap-2"
        >
            <VCIcon
                name="fa6-solid:circle-notch"
                class="animate-spin"
            />
            <span>Loading credentials…</span>
        </div>
        <div
            v-else
            class="flex flex-col gap-2"
        >
            <VCFormGroup :label-class="'w-full mb-1'">
                <template #label>
                    <div class="flex flex-row">
                        <div>Host</div>
                        <div class="ms-auto">
                            <button
                                type="button"
                                class="btn btn-xs btn-dark"
                                :disabled="!host"
                                @click.prevent="copy(host)"
                            >
                                <VCIcon name="fa6-solid:copy" /> Copy
                            </button>
                        </div>
                    </div>
                </template>
                <template #default>
                    <VCFormInput
                        :model-value="host"
                        :readonly="true"
                    />
                </template>
            </VCFormGroup>

            <VCFormGroup :label-class="'w-full mb-1'">
                <template #label>
                    <div class="flex flex-row">
                        <div>Project</div>
                        <div class="ms-auto">
                            <button
                                type="button"
                                class="btn btn-xs btn-dark"
                                :disabled="!externalName"
                                @click.prevent="copy(externalName)"
                            >
                                <VCIcon name="fa6-solid:copy" /> Copy
                            </button>
                        </div>
                    </div>
                </template>
                <template #default>
                    <VCFormInput
                        :model-value="externalName"
                        :readonly="true"
                    />
                </template>
            </VCFormGroup>

            <VCFormGroup :label-class="'w-full mb-1'">
                <template #label>
                    <div class="flex flex-row">
                        <div>Account Name</div>
                        <div class="ms-auto">
                            <button
                                type="button"
                                class="btn btn-xs btn-dark"
                                :disabled="!accountName"
                                @click.prevent="copy(accountName)"
                            >
                                <VCIcon name="fa6-solid:copy" /> Copy
                            </button>
                        </div>
                    </div>
                </template>
                <template #default>
                    <VCFormInput
                        :model-value="accountName"
                        :readonly="true"
                    />
                </template>
            </VCFormGroup>

            <VCFormGroup :label-class="'w-full mb-1'">
                <template #label>
                    <div class="flex flex-row">
                        <div>Secret</div>
                        <div class="ms-auto flex flex-row gap-1">
                            <button
                                type="button"
                                class="btn btn-xs btn-dark"
                                @click.prevent="toggleReveal"
                            >
                                <VCIcon :name="revealed ? 'fa6-solid:eye-slash' : 'fa6-solid:eye'" />
                                {{ revealed ? 'Hide' : 'Reveal' }}
                            </button>
                            <button
                                type="button"
                                class="btn btn-xs btn-dark"
                                :disabled="!accountSecret"
                                @click.prevent="copy(accountSecret)"
                            >
                                <VCIcon name="fa6-solid:copy" /> Copy
                            </button>
                        </div>
                    </div>
                </template>
                <template #default>
                    <VCFormInput
                        :model-value="accountSecret"
                        :type="revealed ? 'text' : 'password'"
                        :readonly="true"
                    />
                </template>
            </VCFormGroup>
        </div>
    </div>
</template>
