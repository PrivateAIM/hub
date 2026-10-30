import type { DatabaseConnection } from './types.ts';

declare module 'vitest' {
    interface ProvidedContext {
        AUTHUP_URL: string
        DATABASE_CONNECTION: DatabaseConnection | null
    }
}
