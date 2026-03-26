import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

// Load .env.local — Next.js does this automatically, but drizzle-kit runs outside Next.js
config({ path: '.env.local' })

export default defineConfig({
  schema: './src/shared/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    url: process.env.DATABASE_URL!,
  },
})
