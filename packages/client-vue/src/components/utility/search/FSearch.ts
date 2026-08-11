/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { contains, or } from '@rapiq/core';
import { useDebounceFn } from '@vueuse/core';
import { VCFormInput } from '@vuecs/forms';
import { VCIcon } from '@vuecs/icon';
import type { PropType, SlotsType } from 'vue';
import { defineComponent, h } from 'vue';
import { hasNormalizedSlot, normalizeSlot } from '../../../core';
import type { ListLoadFn, ListMeta } from '../../../core';

const DEBOUNCE_MS = 300;

/**
 * Free-text search over a list.
 *
 * Deliberately NOT a pass-through to authup's `<ASearch>`, which emits
 * `filters: { name: text }` — an EQUALITY filter, so typing "bruce" never
 * matched "bruce-proj" and the box appeared to do nothing. Hub builds a
 * `contains` expression instead, across every configured field:
 *
 *   or(contains('name', text), contains('displayName', text))
 *
 * `fields` MUST name filterable keys of the list's entity. rapiq's v2
 * expression dialect resolves paths strictly and rejects an unknown key with
 * a 400 rather than pruning it, so pointing this at an entity whose schema
 * does not allow the field turns a no-op search into a failed request.
 */
export const FSearch = defineComponent({
    props: {
        /**
         * Entity fields to match the text against. Every one must appear in
         * the entity's server-side `filters.allowed`.
         */
        fields: {
            type: Array as PropType<string[]>,
            default: () => ['name', 'displayName'],
        },
        icon: { type: Boolean },
        iconPosition: { type: String as PropType<'start' | 'end'> },
        iconClass: { type: String },
        busy: { type: Boolean },
        // A generic utility renderer: it forwards whatever loader/meta the parent
        // list produces. Pinning M here would make the prop invariant against the
        // per-entity ListMeta<T> (rapiq's SortsBuildInput<T> is a literal union),
        // so the loader stays parameter-generic.
        load: { type: Function as PropType<ListLoadFn> },
        meta: { type: Object as PropType<ListMeta<any>> },
    },
    slots: Object as SlotsType<{
        default: Record<string, any>,
        icon: Record<string, any>
    }>,
    setup(props, { slots }) {
        const buildFilters = (text: string) => {
            if (text.length === 0) {
                // An empty expression would filter everything out; `{}` is how
                // the list clears the previous search instead.
                return {};
            }

            const [first, ...rest] = props.fields.map((field) => contains(field, text));

            if (!first) {
                // No fields configured — nothing to match against.
                return {};
            }

            // `or` of a single condition is legal but adds a pointless compound
            // wrapper to the query string.
            return rest.length === 0 ? first : or(first, ...rest);
        };

        const handle = useDebounceFn((text: string) => {
            if (!props.load || props.meta?.busy || props.busy) {
                return Promise.resolve();
            }

            return props.load({
                filters: buildFilters(text) as any,
                // A narrowed result set almost never has the page the user was
                // on, so reset to the first.
                pagination: { offset: 0 },
            });
        }, DEBOUNCE_MS);

        return () => {
            const icon = props.icon ?? true;
            const iconClass = props.iconClass || 'fa6-solid:magnifying-glass';
            const iconPosition = props.iconPosition ?? 'start';

            if (hasNormalizedSlot('default', slots)) {
                return normalizeSlot('default', {
                    load: props.load,
                    busy: props.busy,
                    icon,
                    iconClass,
                    iconPosition,
                }, slots);
            }

            const inputProps : Record<string, any> = {
                type: 'text',
                modelValue: '',
                'onUpdate:modelValue': (text: string) => handle(text),
                placeholder: '...',
            };

            const inputSlots : Record<string, any> = {};

            if (icon) {
                const iconNode = (slotProps: Record<string, any> = {}) => h('div', { class: slotProps.class }, [
                    hasNormalizedSlot('icon', slots) ?
                        normalizeSlot('icon', {}, slots) :
                        h(VCIcon, { name: iconClass }),
                ]);

                if (iconPosition === 'start') {
                    inputProps.groupPrepend = true;
                    inputSlots.groupPrepend = iconNode;
                } else {
                    inputProps.groupAppend = true;
                    inputSlots.groupAppend = iconNode;
                }
            }

            return h(VCFormInput, inputProps, inputSlots);
        };
    },
});
