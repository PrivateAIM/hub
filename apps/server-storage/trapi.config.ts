import { defineConfig } from '@trapi/cli';

export default defineConfig({
    metadata: {
        entryPoint: 'src/adapters/http/controllers/**/*.ts',
        preset: '@routup/decorators/preset',
        tsconfig: 'tsconfig.json',
    },
    swagger: {
        version: 'v3.2',
        data: {
            name: 'PrivateAIM Hub Storage API',
            securityDefinitions: {
                bearer: {
                    type: 'apiKey',
                    name: 'Authorization',
                    in: 'header',
                },
                basicAuth: {
                    type: 'http',
                    scheme: 'basic',
                },
            },
        },
    },
    output: { path: 'writable/swagger.json' },
});
