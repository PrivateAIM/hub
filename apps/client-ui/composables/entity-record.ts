/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Ref } from 'vue';
import {
    createError,
    navigateTo,
    useAsyncData,
    useNuxtApp,
    useNuxtData,
} from '#app';

/**
 * Narrows away the `undefined` an async-data entry carries until its handler
 * has resolved.
 *
 * A predicate rather than an inline check, because only a predicate rewrites
 * the type of the REF itself — detail-page templates dereference `entity.name`
 * unconditionally, so handing them a `Ref<T | undefined>` fails
 * `nuxi typecheck` at every call site.
 */
function isRecordResolved<T>(input: Ref<T | undefined>) : input is Ref<T> {
    return typeof input.value !== 'undefined';
}

/**
 * Load the one record a detail page is about, through the hydration payload.
 *
 * The record is fetched during the server render and travels to the browser in
 * `nuxtApp.payload.data`, so hydration adopts what the server already read
 * instead of repeating the request — the detail-page counterpart of the
 * snapshot handoff `createList` implements for collections.
 *
 * `fn` MUST close over an already-injected client, for the same reason the
 * context note below spells out: it can run after the first `await` in
 * `setup()`, where `inject()` resolves against nothing.
 *
 * `fallbackPath` is where the page bails out to when the record cannot be read
 * — deleted, forbidden, or the service is unreachable.
 *
 * ponytail: only the data ref is handed back, so a page cannot re-read or show
 * a loading state for its own record; nothing needs that today. Return the
 * whole `AsyncData` handle when one does.
 */
export async function useEntityRecord<T>(
    key: string,
    fn: () => Promise<T>,
    fallbackPath: string,
) : Promise<Ref<T>> {
    // Everything past this function's first `await` runs with no ambient Nuxt
    // context. `experimental.asyncContext` is off (the default), so on the
    // server nothing restores it across an await inside an async `setup()`, and
    // a composable called there throws `[nuxt] instance unavailable` instead of
    // doing its job. Hence: every context-dependent call is made up front,
    // here, or replayed through `runWithContext` below.
    const nuxtApp = useNuxtApp();

    // Not awaited yet — `useAsyncData` registers the entry synchronously and
    // hands back a promise, and the registration is what has to happen while
    // the component instance is still current (it is what schedules the server
    // fetch and the hydration handoff).
    const asyncData = useAsyncData<T>(key, fn, {
        // MANDATORY. Nuxt 4 backs an async-data entry with a `shallowRef`
        // unless told otherwise, while every detail page applies an update
        // PER PROPERTY (`updateObjectProperties(entity, e)` /
        // `extendObject(entity.value, e)`). A shallow ref reacts to neither,
        // so dropping this leaves the page rendering pre-save values —
        // nothing throws, nothing is logged, the save just looks lost.
        deep: true,
    });

    // The same entry, read back through the one API that declares it as
    // `Ref<T | undefined>`. `useAsyncData` types its own data ref as
    // `Ref<PickFrom<T, KeysOf<T>> | undefined>`, a conditional TypeScript
    // cannot resolve while `T` is still a type parameter, so it never narrows
    // to the `Ref<T>` the templates need — and the alternative, an `as` cast
    // here, would swallow a real mismatch just as willingly.
    const { data } = useNuxtData<T>(key);

    const { error, refresh } = await asyncData;

    // While hydrating a key the payload has no entry for, Nuxt 4 DEFERS the
    // initial fetch to `onBeforeMount`, so the await above resolves with
    // neither a record nor an error. That is a load which has not run yet, not
    // a failed one — deciding on it would bounce a page that is merely late.
    // `refresh` is a closure over the async-data entry, so it needs no context.
    if (!error.value && !isRecordResolved(data)) {
        await refresh();
    }

    if (error.value || !isRecordResolved(data)) {
        // `navigateTo` inside `setup()` only schedules the redirect; without
        // the throw the page still renders, and its template dereferences the
        // record that is not there.
        await nuxtApp.runWithContext(() => navigateTo({ path: fallbackPath }));

        throw createError({});
    }

    return data;
}
