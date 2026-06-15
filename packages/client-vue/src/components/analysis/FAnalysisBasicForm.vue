<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { IFieldValidation } from '@ilingo/validup-vue';
import type { Analysis, Project } from '@privateaim/core-kit';
import { AnalysisValidator, DomainType } from '@privateaim/core-kit';
import { ValidatorGroup, generateName } from '@privateaim/kit';
import { useValidup } from '@validup/vue';
import type { BuildInput } from 'rapiq';
import type { PropType } from 'vue';
import {
    computed,
    defineComponent,
    onMounted,
    reactive,
    ref,
    watch,
} from 'vue';
import { VCFormInput } from '@vuecs/forms';
import { useUpdatedAt } from '../../composables';
import {
    createEntityManager,
    defineEntityManagerEvents,
    initFormAttributesFromSource,
    wrapFnWithBusyState,
} from '../../core';
import { FProjects } from '../project';
import { FSearch } from '../utility';

export default defineComponent({
    components: {
        FSearch,
        IFieldValidation,
        VCFormInput,
        FProjects,
    },
    props: {
        entity: { type: Object as PropType<Analysis> },
        projectId: { type: String as PropType<string | undefined | null> },
        realmId: { type: String },
    },
    emits: defineEntityManagerEvents<Analysis>(),
    setup(props, setup) {
        const busy = ref(false);
        const form = reactive({
            project_id: '',
            name: '',
            display_name: '',
            description: '',
        });

        const proposalQuery = computed<BuildInput<Project>>(() => ({ filters: { ...(props.realmId ? { realm_id: props.realmId } : {}) } }));

        const manager = createEntityManager({
            type: `${DomainType.ANALYSIS}`,
            setup,
            props,
        });

        const isEditing = computed(() => !!manager.data.value);

        const v = useValidup(
            new AnalysisValidator(),
            form,
            { group: computed(() => (isEditing.value ? ValidatorGroup.UPDATE : ValidatorGroup.CREATE)) },
        );

        if (props.projectId) {
            form.project_id = props.projectId as string;
        }

        const initFromProperties = () => {
            if (!manager.data.value) return;

            initFormAttributesFromSource(form, manager.data.value);
        };

        initFromProperties();

        // Pre-fill an editable, generated name suggestion when creating a new
        // analysis. Runs client-side only to avoid SSR hydration mismatches.
        onMounted(() => {
            if (!props.entity && !form.name) {
                form.name = generateName();
            }
        });

        const updatedAt = useUpdatedAt(props.entity);

        watch(updatedAt, (val, oldVal) => {
            if (val && val !== oldVal) {
                manager.data.value = props.entity;

                initFromProperties();
            }
        });

        const add = wrapFnWithBusyState(busy, async () => {
            // Normalize the slug exactly like the backend (trim + lowercase) so
            // the value that was validated is the value that gets submitted and
            // stored.
            if (form.name) {
                form.name = form.name.trim().toLowerCase();
            }

            await manager.createOrUpdate(form);
        });

        const toggle = (key: keyof typeof form, id: any) => {
            if (form[key] === id) {
                form[key] = null as any;
            } else {
                form[key] = id;
            }
        };

        return {
            v,
            form,
            add,
            toggle,
            proposalQuery,
            busy,
            isEditing,
        };
    },
});
</script>
<template>
    <form @submit.prevent="add">
        <div class="row">
            <div class="col">
                <IFieldValidation
                    v-slot="{ value }"
                    :field="v.fields.display_name"
                >
                    <VCFormGroup :validation="value">
                        <template #label>
                            Display Name
                        </template>
                        <VCFormInput
                            :model-value="v.fields.display_name.$model.value ?? ''"
                            @update:model-value="(next: string) => { v.fields.display_name.$model.value = next; }"
                        />
                    </VCFormGroup>
                </IFieldValidation>

                <hr>

                <IFieldValidation
                    v-slot="{ value }"
                    :field="v.fields.name"
                >
                    <VCFormGroup :validation="value">
                        <template #label>
                            Name
                        </template>
                        <VCFormInput
                            :model-value="v.fields.name.$model.value ?? ''"
                            @update:model-value="(next: string) => { v.fields.name.$model.value = next; }"
                        />
                        <small class="text-fg-muted">
                            URL-friendly identifier (letters, numbers, - _ .).
                            A suggestion is filled in automatically — edit it if you like.
                        </small>
                    </VCFormGroup>
                </IFieldValidation>

                <hr>

                <IFieldValidation
                    v-slot="{ value }"
                    :field="v.fields.description"
                >
                    <VCFormGroup :validation="value">
                        <template #label>
                            Description
                        </template>
                        <VCFormTextarea
                            :model-value="v.fields.description.$model.value ?? ''"
                            rows="4"
                            @update:model-value="(next: string) => { v.fields.description.$model.value = next; }"
                        />
                    </VCFormGroup>
                </IFieldValidation>

                <div>
                    <button
                        type="submit"
                        class="btn btn-xs btn-primary"
                        :disabled="v.$invalid.value || busy"
                        @click.prevent="add"
                    >
                        <template v-if="isEditing">
                            <VCIcon name="fa6-solid:floppy-disk" /> update
                        </template>
                        <template v-else>
                            <VCIcon name="fa6-solid:plus" /> create
                        </template>
                    </button>
                </div>
            </div>
            <div
                v-if="!projectId && !isEditing"
                class="col"
            >
                <FProjects :query="proposalQuery">
                    <template #header="props">
                        <label>Projects</label>

                        <FSearch
                            :load="props.load"
                            :meta="props.meta"
                        />
                    </template>
                    <template #itemActions="props">
                        <button
                            :disabled="props.busy"
                            type="button"
                            class="btn btn-xs"
                            :class="{
                                'btn-dark': form.project_id !== props.data.id,
                                'btn-warning': form.project_id === props.data.id
                            }"
                            @click.prevent="toggle('project_id', props.data.id)"
                        >
                            <VCIcon :name="form.project_id !== props.data.id ? 'fa6-solid:plus' : 'fa6-solid:minus'" />
                        </button>
                    </template>
                </FProjects>

                <div
                    v-if="!v.fields.project_id.$model.value"
                    class="alert alert-sm alert-warning"
                >
                    Choose a project as base of your analysis
                </div>
            </div>
        </div>
    </form>
</template>
