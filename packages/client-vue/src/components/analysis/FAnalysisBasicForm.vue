<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { IVuelidate } from '@ilingo/vuelidate';
import type { Analysis, Project } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';
import { maxLength, minLength, required } from '@vuelidate/validators';
import type { BuildInput } from 'rapiq';
import useVuelidate from '@vuelidate/core';
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, ref,
} from 'vue';
import { VCFormInput } from '@vuecs/form-controls';
import {
    createEntityManager, defineEntityManagerEvents, wrapFnWithBusyState,
} from '../../core';
import { FProjects } from '../project';
import { FSearch } from '../utility';

export default defineComponent({
    components: {
        FSearch,
        IVuelidate,
        VCFormInput,
        FProjects,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
        },
        projectId: {
            type: String as PropType<string | undefined | null>,
        },
        realmId: {
            type: String,
        },
    },
    emits: defineEntityManagerEvents<Analysis>(),
    setup(props, setup) {
        const busy = ref(false);
        const form = reactive({
            project_id: '',
            name: '',
            description: '',
        });

        const $v = useVuelidate({
            project_id: {
                required,
            },
            name: {
                minLength: minLength(3),
                maxLength: maxLength(128),
            },
            description: {
                minLength: minLength(5),
                maxLength: maxLength(4096),
            },
        }, form);

        const proposalQuery = computed<BuildInput<Project>>(() => ({
            filters: {
                ...(props.realmId ? { realm_id: props.realmId } : {}),
            },
        }));

        if (props.projectId) {
            form.project_id = props.projectId as string;
        }

        const manager = createEntityManager({
            type: `${DomainType.ANALYSIS}`,
            setup,
            props,
        });

        const add = wrapFnWithBusyState(busy, async () => {
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
            v$: $v,
            form,
            add,
            toggle,
            proposalQuery,
            busy,
        };
    },
});
</script>
<template>
    <form @submit.prevent="add">
        <div class="row">
            <div class="col">
                <IVuelidate :validation="v$.name">
                    <template #default="props">
                        <VCFormGroup
                            :validation-messages="props.data"
                            :validation-severity="props.severity"
                        >
                            <template #label>
                                Name
                            </template>
                            <template #default>
                                <VCFormInput
                                    v-model="v$.name.$model"
                                />
                            </template>
                        </VCFormGroup>
                    </template>
                </IVuelidate>

                <hr>

                <IVuelidate :validation="v$.description">
                    <template #default="props">
                        <VCFormGroup
                            :validation-messages="props.data"
                            :validation-severity="props.severity"
                        >
                            <template #label>
                                Description
                            </template>
                            <template #default>
                                <VCFormTextarea
                                    v-model="v$.description.$model"
                                    rows="4"
                                />
                            </template>
                        </VCFormGroup>
                    </template>
                </IVuelidate>

                <div>
                    <button
                        type="submit"
                        class="btn btn-xs btn-primary"
                        :disabled="v$.$invalid || busy"
                        @click.prevent="add"
                    >
                        <i class="fa fa-plus" /> create
                    </button>
                </div>
            </div>
            <div
                v-if="!projectId"
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
                            <i
                                :class="{
                                    'fa fa-plus': form.project_id !== props.data.id,
                                    'fa fa-minus': form.project_id === props.data.id
                                }"
                            />
                        </button>
                    </template>
                </FProjects>

                <div
                    v-if="!v$.project_id.required && !v$.project_id.$model"
                    class="alert alert-sm alert-warning"
                >
                    Choose a project as base of your analysis
                </div>
            </div>
        </div>
    </form>
</template>
