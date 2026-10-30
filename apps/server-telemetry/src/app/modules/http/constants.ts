/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TypedToken } from 'eldin';
import type { App } from 'routup';
import type { HTTPServer } from './types.ts';

export const HTTPInjectionKey : {
    App: TypedToken<App>,
    Server: TypedToken<HTTPServer>,
} = {
    App: new TypedToken<App>('App'),
    Server: new TypedToken<HTTPServer>('Server'),
};
