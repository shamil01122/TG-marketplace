import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
import * as rumSchema from './rum-schema'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
export const db = drizzle(pool, { schema: { ...schema, ...rumSchema } })
export * from './schema'
export * from './rum-schema'
