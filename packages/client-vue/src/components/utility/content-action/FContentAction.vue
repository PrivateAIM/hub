<!--
  - Copyright (c) 2026.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { VCButton } from '@vuecs/button';
import { VCIcon } from '@vuecs/icon';
import { VCLink } from '@vuecs/link';
import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';

/**
 * The primary action of a collection section, rendered at the right of the
 * section's title row — replacing the vertical "overview + add" pill rail
 * that used to sit in a `.content-sidebar` beside the list.
 *
 * It is deliberately route-aware rather than a plain link, so a section
 * needs exactly ONE of these no matter which of its routes is active:
 *
 *   on `overviewUrl`  ->  `+ Add`   (primary)
 *   on `addUrl`       ->  `<- Back` (outline) — the add form is a route of
 *                                    its own, so without this it would be a
 *                                    dead end once the rail is gone
 *   anywhere else     ->  nothing
 *
 * That last case is load-bearing: a section's list routes are not
 * interchangeable. `/projects` and `/projects/in` are siblings, but the
 * incoming list is an approval queue for node authorities, not a place to
 * create a project.
 *
 * `addDisabled` carries the create permission. `VCButton` disables a link
 * target via `aria-disabled` + a capture-phase click guard, so a disabled
 * button genuinely cannot navigate into a page the actor would be rejected
 * from.
 */
export default defineComponent({
    components: {
        VCButton,
        VCIcon,
    },
    props: {
        /** Route on which the `+ Add` button renders. */
        overviewUrl: {
            type: String,
            required: true,
        },
        /** Route the `+ Add` button targets, and on which `<- Back` renders. */
        addUrl: {
            type: String,
            required: true,
        },
        addDisabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const route = useRoute();

        // A trailing slash is a distinct `route.path` but the same page, and
        // an exact compare is what keeps the button off sibling routes.
        const normalize = (value: string) => (
            value.length > 1 && value.endsWith('/') ?
                value.slice(0, -1) :
                value
        );

        const mode = computed<'add' | 'back' | undefined>(() => {
            const path = normalize(route.path);

            if (path === normalize(props.addUrl)) {
                return 'back';
            }

            if (path === normalize(props.overviewUrl)) {
                return 'add';
            }

            return undefined;
        });

        return {
            mode,
            VCLink,
        };
    },
});
</script>
<template>
    <VCButton
        v-if="mode === 'back'"
        :as="VCLink"
        :to="overviewUrl"
        size="sm"
        color="neutral"
        variant="outline"
    >
        <VCIcon
            name="fa6-solid:arrow-left"
            class="me-1"
        /> Back
    </VCButton>
    <VCButton
        v-else-if="mode === 'add'"
        :as="VCLink"
        :to="addUrl"
        size="sm"
        color="primary"
        :disabled="addDisabled"
    >
        <VCIcon
            name="fa6-solid:plus"
            class="me-1"
        /> Add
    </VCButton>
</template>
