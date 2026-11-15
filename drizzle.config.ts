import { defineConfig } from 'drizzle-kit'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())
export default defineConfig({
  schema: [
    './src/lib/db/schema.ts',
    './src/lib/db/rum-schema.ts',
  ],
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
