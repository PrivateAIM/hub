/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { nextTick, useTemplateRef } from 'vue';

// A scroll position within this many pixels of the bottom counts as "at the
// bottom" and keeps following the most recent entries after an update.
const BOTTOM_THRESHOLD = 24;

// A scroll position within this many pixels of the top counts as "at the top".
const TOP_THRESHOLD = 4;

/**
 * Preserve a sensible scroll position across a content update of a scrollable
 * element (referenced by the given template ref key):
 * - at the bottom -> keep following the most recent entries (stay at the bottom)
 * - at the top    -> stay at the top
 * - in between     -> keep the currently viewed entry in place
 *
 * `update` performs the content mutation; the scroll position is restored on
 * the next tick once the DOM has been patched.
 */
export function useScrollPreserver(refKey: string) {
    const element = useTemplateRef<HTMLElement>(refKey);

    const preserve = async (update: () => void | Promise<void>) : Promise<void> => {
        const el = element.value;

        let atBottom = false;
        let atTop = false;
        let scrollTop = 0;

        if (el) {
            scrollTop = el.scrollTop;
            atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_THRESHOLD;
            atTop = el.scrollTop <= TOP_THRESHOLD;
        }

        await update();
        await nextTick();

        const target = element.value;
        if (!target) {
            return;
        }

        if (atBottom) {
            target.scrollTop = target.scrollHeight;
        } else if (atTop) {
            target.scrollTop = 0;
        } else {
            target.scrollTop = scrollTop;
        }
    };

    return { preserve };
}
