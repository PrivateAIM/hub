/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { useFieldValidation } from '@ilingo/validup-vue';
import { useValidup } from '@validup/vue';
import type { Severity } from '@validup/vue';
import type {
    RegistryProject,
} from '@privateaim/core-kit';
import {
    DomainType,
    RegistryAPICommand,
    ServiceID,
    registryRobotSecretRegex,
} from '@privateaim/core-kit';
import { buildFormGroup, buildFormInput } from '@authup/client-web-kit';
import { Container } from 'validup';
import { createValidator } from '@validup/zod';
import { z } from 'zod';
import type { SlotsType, VNodeChild } from 'vue';
import {
    defineComponent,
    h,
    reactive,
    ref,
    resolveComponent,
} from 'vue';
import type { EntityManagerSlotsType } from '../../core';
import {
    createEntityManager,
    defineEntityManagerEvents,
    defineEntityManagerProps,
    injectCoreHTTPClient,
    wrapFnWithBusyState,
} from '../../core';

class RegistryProjectSecretValidator extends Container<{ secret: string }> {
    protected initialize() {
        super.initialize();

        this.mount(
            'secret',
            { optional: true },
            createValidator(z.string().regex(registryRobotSecretRegex)),
        );
    }
}

export default defineComponent({
    props: defineEntityManagerProps<RegistryProject>(),
    emits: defineEntityManagerEvents<RegistryProject>(),
    slots: Object as SlotsType<EntityManagerSlotsType<RegistryProject>>,
    async setup(props, setup) {
        const apiClient = injectCoreHTTPClient();
        const busy = ref(false);

        const form = reactive({ secret: '' });

        const $v = useValidup(new RegistryProjectSecretValidator(), form);

        const secretValidation = useFieldValidation($v.fields.secret);

        const toSeverity = (input: Severity) => (input === 'error' || input === 'warning' ? input : undefined);

        const manager = createEntityManager({
            type: `${DomainType.REGISTRY_PROJECT}`,
            setup,
            props,
            onResolved(entity) {
                if (entity) {
                    form.secret = entity.account_secret || '';
                }
            },
            onUpdated: (entity) => {
                if (entity) {
                    form.secret = entity.account_secret || '';
                }
            },
        });

        await manager.resolve({
            query: {
                fields: [
                    '+account_id',
                    '+account_name',
                    '+account_secret',
                ],
            },
        });

        const execute = async (command: RegistryAPICommand) => wrapFnWithBusyState(busy, async () => {
            if (!manager.data.value) return;

            try {
                await apiClient.service.runCommand(ServiceID.REGISTRY, command, {
                    id: manager.data.value.id,
                    secret: form.secret,
                });

                setup.emit('updated', manager.data.value);
            } catch (e) {
                if (e instanceof Error) {
                    setup.emit('failed', e);
                }
            }
        })();

        if (!manager.data.value) {
            return () => h(
                'div',
                { class: 'alert alert-sm alert-warning' },
                [
                    'The registry-project details can not be displayed.',
                ],
            );
        }

        return () => {
            const VCIcon = resolveComponent('VCIcon');
            const fallback = () : VNodeChild => h('div', [
                h('div', { class: 'mb-2 flex flex-col' }, [
                    h('div', { class: 'form-group' }, [
                        h('label', { class: 'pe-1' }, 'Project'),
                        h('input', {
                            class: 'form-control',
                            type: 'text',
                            value: manager.data.value?.external_name || '',
                            disabled: true,
                        }),
                    ]),

                    h('div', [
                        h('div', { class: 'form-group' }, [
                            h('label', { class: 'pe-1' }, 'Account ID'),
                            h('input', {
                                class: 'form-control',
                                type: 'text',
                                value: manager.data.value?.account_name || '',
                                placeholder: '...',
                                disabled: true,
                            }),
                        ]),
                        buildFormGroup({
                            label: true,
                            labelContent: 'Account Secret',
                            validationMessages: secretValidation.messages,
                            validationSeverity: toSeverity(secretValidation.severity),
                            content: buildFormInput({
                                props: { placeholder: '...' },
                                value: form.secret,
                                onChange(value) {
                                    form.secret = value;
                                },
                            }),
                        }),
                    ]),

                    h('div', [
                        h('strong', { class: 'pe-1' }, 'Webhook:'),
                        h(VCIcon, {
                            name: manager.data.value?.webhook_exists ? 'fa6-solid:check' : 'fa6-solid:xmark',
                            class: manager.data.value?.webhook_exists ? 'text-success-600' : 'text-error-600',
                        }),
                    ]),
                ]),
                h('hr'),
                h('div', { class: 'row' }, [
                    h('div', { class: 'col' }, [
                        h('div', { class: 'alert alert-sm alert-info' }, [
                            'Connect the database entity to the registry.',
                        ]),
                        h('div', { class: 'text-center' }, [
                            h('button', {
                                class: 'btn btn-xs btn-primary',
                                disabled: busy.value,
                                type: 'button',
                                onClick($event: any) {
                                    $event.preventDefault();

                                    return execute(RegistryAPICommand.PROJECT_LINK);
                                },
                            }, [
                                h(VCIcon, { name: 'fa6-solid:plug', class: 'pe-1' }),
                                'Connect',
                            ]),
                        ]),
                    ]),
                    h('div', { class: 'col' }, [
                        h('div', { class: 'alert alert-sm alert-warning' }, [
                            'Disconnect the database entity of the registry.',
                        ]),
                        h('div', { class: 'text-center' }, [
                            h('button', {
                                class: 'btn btn-xs btn-danger',
                                disabled: busy.value,
                                type: 'button',
                                onClick($event: any) {
                                    $event.preventDefault();
                                    return execute(RegistryAPICommand.PROJECT_UNLINK);
                                },
                            }, [
                                h(VCIcon, { name: 'fa6-solid:power-off', class: 'pe-1' }),
                                'Disconnect',
                            ]),
                        ]),
                    ]),
                ]),
            ]);

            return manager.render(fallback);
        };
    },
});
