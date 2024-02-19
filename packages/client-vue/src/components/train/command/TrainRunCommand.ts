/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import {
    computed, defineComponent, ref, toRefs,
} from 'vue';
import type { PropType } from 'vue';
import type { Analysis } from '@privateaim/core';
import {
    AnalysisAPICommand,
    AnalysisBuildStatus,
    AnalysisRunStatus,
    PermissionID,
} from '@privateaim/core';
import type { TrainCommandProperties } from './type';
import {
    injectAPIClient, injectAuthupStore, renderActionCommand, wrapFnWithBusyState,
} from '../../../core';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
        command: {
            type: String as PropType<AnalysisAPICommand>,
            default: AnalysisAPICommand.RUN_START,
        },
        elementType: {
            type: String as PropType<TrainCommandProperties['elementType']>,
            default: 'button',
        },
        withIcon: {
            type: Boolean,
            default: false,
        },
        withText: {
            type: Boolean,
            default: true,
        },
    },
    emits: ['failed', 'updated', 'executed'],
    setup(props, { emit, slots }) {
        const apiClient = injectAPIClient();
        const refs = toRefs(props);
        const busy = ref(false);

        const store = injectAuthupStore();
        const isAllowed = computed(() => store.has(PermissionID.ANALYSIS_EXECUTION_START) ||
                store.has(PermissionID.ANALYSIS_EXECUTION_STOP));

        const isDisabled = computed(() => {
            if (refs.entity.value.build_status !== AnalysisBuildStatus.FINISHED) {
                return true;
            }

            if (refs.command.value === AnalysisAPICommand.RUN_START) {
                return !!refs.entity.value.run_status &&
                    [AnalysisRunStatus.STOPPED, AnalysisRunStatus.STOPPING, AnalysisRunStatus.FAILED].indexOf(refs.entity.value.run_status) === -1;
            }

            if (refs.command.value === AnalysisAPICommand.RUN_RESET) {
                return !!refs.entity.value.run_status &&
                    [AnalysisRunStatus.STOPPED, AnalysisRunStatus.STOPPING, AnalysisRunStatus.FAILED].indexOf(refs.entity.value.run_status) === -1;
            }

            return false;
        });

        const commandText = computed(() => {
            switch (refs.command.value) {
                case AnalysisAPICommand.RUN_START:
                    return 'start';
                case AnalysisAPICommand.RUN_RESET:
                    return 'reset';
                case AnalysisAPICommand.RUN_STATUS:
                    return 'check';
                default:
                    return '';
            }
        });

        const iconClass = computed(() => {
            switch (refs.command.value) {
                case AnalysisAPICommand.RUN_START:
                    return 'fa fa-play';
                case AnalysisAPICommand.RUN_RESET:
                    return 'fa-solid fa-retweet';
                case AnalysisAPICommand.RUN_STATUS:
                    return 'fas fa-shield-alt';
                default:
                    return '';
            }
        });

        const classSuffix = computed(() => {
            switch (refs.command.value) {
                case AnalysisAPICommand.RUN_START:
                    return 'success';
                case AnalysisAPICommand.RUN_RESET:
                    return 'danger';
                case AnalysisAPICommand.RUN_STATUS:
                    return 'primary';
                default:
                    return 'info';
            }
        });

        const execute = wrapFnWithBusyState(busy, async () => {
            try {
                const train = await apiClient.analysis.runCommand(refs.entity.value.id, refs.command.value);

                emit('executed', props.command);
                emit('updated', train);
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        return () => renderActionCommand({
            execute,
            elementType: refs.elementType.value,
            withIcon: refs.withIcon.value,
            withText: refs.withText.value,
            isDisabled: isDisabled.value,
            iconClass: iconClass.value,
            isAllowed: isAllowed.value,
            commandText: commandText.value,
            classSuffix: classSuffix.value,
            slots,
        });
    },
});
