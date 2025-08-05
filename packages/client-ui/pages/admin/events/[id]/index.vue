<!--
  - Copyright (c) 2022-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { FEventExpiring } from '@privateaim/client-vue';
import type { Event } from '@privateaim/telemetry-kit';
import type { PropType } from 'vue';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: { FEventExpiring },
    props: {
        entity: {
            type: Object as PropType<Event>,
            required: true,
        },
    },
    emits: ['failed', 'updated'],
    methods: {
        handleUpdated(e: Event) {
            this.$emit('updated', e);
        },
        handleFailed(e: Event) {
            this.$emit('failed', e);
        },
    },
});
</script>
<template>
    <div class="d-flex flex-column gap-3">
        <div class="row">
            <div class="col-4">
                <div class="card-grey card">
                    <div class="card-header">
                        <span class="title">
                            General
                        </span>
                    </div>
                    <div class="card-body">
                        <div class="d-flex flex-column gap-3">
                            <div class="d-flex flex-row gap-3">
                                <div class="flex-grow-1">
                                    <strong>Name</strong>
                                </div>
                                <div class="">
                                    {{ entity.name }}
                                </div>
                            </div>
                            <div class="d-flex flex-row gap-3">
                                <div class="flex-grow-1">
                                    <strong>Scope</strong>
                                </div>
                                <div class="">
                                    {{ entity.scope }}
                                </div>
                            </div>
                            <div class="d-flex flex-row gap-3">
                                <div class="flex-grow-1">
                                    <strong>Ref Type</strong>
                                </div>
                                <div class="">
                                    {{ entity.ref_type }}
                                </div>
                            </div>
                            <div class="d-flex flex-row gap-3">
                                <div class="flex-grow-1">
                                    <strong>Ref ID</strong>
                                </div>
                                <div class="">
                                    {{ entity.ref_id }}
                                </div>
                            </div>
                            <div class="d-flex flex-row gap-3">
                                <div class="flex-grow-1">
                                    <strong>Created</strong>
                                </div>
                                <div class="">
                                    <VCTimeago :datetime="entity.created_at" />
                                </div>
                            </div>
                            <div class="d-flex flex-row gap-3">
                                <div class="flex-grow-1">
                                    <strong>Expiring?</strong>
                                </div>
                                <div class="">
                                    <FEventExpiring
                                        :entity="entity"
                                        :direction="'row'"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-4">
                <div class="card-grey card">
                    <div class="card-header">
                        <span class="title">
                            Actor
                        </span>
                    </div>
                    <div class="card-body">
                        <div class="d-flex flex-column gap-3">
                            <div class="d-flex flex-row gap-3">
                                <div class="flex-grow-1">
                                    <strong>Type</strong>
                                </div>
                                <div class="">
                                    {{ entity.actor_type }}
                                </div>
                            </div>
                            <div class="d-flex flex-row gap-3">
                                <div class="flex-grow-1">
                                    <strong>ID</strong>
                                </div>
                                <div class="">
                                    {{ entity.actor_id }}
                                </div>
                            </div>
                            <div class="d-flex flex-row gap-3">
                                <div class="flex-grow-1">
                                    <strong>Name</strong>
                                </div>
                                <div class="">
                                    {{ entity.actor_name }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-4">
                <div class="card-grey card">
                    <div class="card-header">
                        <span class="title">
                            Request
                        </span>
                    </div>
                    <div class="card-body">
                        <div class="d-flex flex-column gap-3">
                            <div class="d-flex flex-row gap-3">
                                <div class="flex-grow-1">
                                    <strong>Path</strong>
                                </div>
                                <div class="">
                                    {{ entity.request_path }}
                                </div>
                            </div>
                            <div class="d-flex flex-row gap-3">
                                <div class="flex-grow-1">
                                    <strong>Method</strong>
                                </div>
                                <div class="">
                                    {{ entity.request_method }}
                                </div>
                            </div>
                            <div class="d-flex flex-row gap-3">
                                <div class="flex-grow-1">
                                    <strong>IP Address</strong>
                                </div>
                                <div class="">
                                    {{ entity.request_ip_address }}
                                </div>
                            </div>
                            <div class="d-flex flex-row gap-3">
                                <div class="flex-grow-1">
                                    <strong>User Agent</strong>
                                </div>
                                <div class="">
                                    {{ entity.request_user_agent }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-grey card">
            <div class="card-header">
                <span class="title">
                    Data
                </span>
            </div>
            <div class="card-body">
                <pre>{{ entity.data }}</pre>
            </div>
        </div>
    </div>
</template>
