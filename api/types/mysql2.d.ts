/**
 * Patch de tipos para mysql2/promise.
 * Relaja el constraint del type parameter T en execute() de QueryResult a `any`,
 * permitiendo execute<CustomType[]>() sin errores de tipo.
 * Los tipos originales de Pool, PoolConnection y createPool no se modifican.
 */

import "mysql2/promise"

declare module "mysql2/promise" {
    interface Pool {
        // Override solo la sobrecarga tipada (la más usada con genérico explícito)
        execute<T extends any[]>(sql: string, values?: any[]): Promise<[T, any]>
        execute<T extends Record<string, any>>(sql: string, values?: any[]): Promise<[T[], any]>
        execute(sql: string, values?: any[]): Promise<[any, any]>
    }
    interface PoolConnection {
        execute<T extends any[]>(sql: string, values?: any[]): Promise<[T, any]>
        execute<T extends Record<string, any>>(sql: string, values?: any[]): Promise<[T[], any]>
        execute(sql: string, values?: any[]): Promise<[any, any]>
        beginTransaction(): Promise<void>
        commit(): Promise<void>
        rollback(): Promise<void>
        release(): void
    }
}
