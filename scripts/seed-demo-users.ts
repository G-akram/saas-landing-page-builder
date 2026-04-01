import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'

import * as schema from '../src/shared/db/schema'

const DEMO_FREE_EMAIL = 'demo@pageforge.com'
const DEMO_PRO_EMAIL = 'pro@pageforge.com'
const DEMO_FREE_PASSWORD = 'Demo1234!'
const DEMO_PRO_PASSWORD = 'Pro1234!'

const FAR_FUTURE = new Date('2099-12-31')

async function seed(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error('DATABASE_URL is not set')

  const sql = neon(dbUrl)
  const db = drizzle(sql, { schema })

  console.log('Seeding demo users...')

  // --- Free demo user ---
  const freeHash = await bcrypt.hash(DEMO_FREE_PASSWORD, 10)
  const existingFree = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, DEMO_FREE_EMAIL))
    .limit(1)

  let freeUserId: string
  if (existingFree.length > 0) {
    freeUserId = existingFree[0]!.id
    await db
      .update(schema.users)
      .set({ passwordHash: freeHash, emailVerified: new Date(), name: 'Demo User' })
      .where(eq(schema.users.id, freeUserId))
    console.log('Updated existing free demo user')
  } else {
    const [inserted] = await db
      .insert(schema.users)
      .values({
        name: 'Demo User',
        email: DEMO_FREE_EMAIL,
        passwordHash: freeHash,
        emailVerified: new Date(),
      })
      .returning({ id: schema.users.id })
    freeUserId = inserted!.id
    console.log('Created free demo user')
  }

  // --- Pro demo user ---
  const proHash = await bcrypt.hash(DEMO_PRO_PASSWORD, 10)
  const existingPro = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, DEMO_PRO_EMAIL))
    .limit(1)

  let proUserId: string
  if (existingPro.length > 0) {
    proUserId = existingPro[0]!.id
    await db
      .update(schema.users)
      .set({ passwordHash: proHash, emailVerified: new Date(), name: 'Pro Demo User' })
      .where(eq(schema.users.id, proUserId))
    console.log('Updated existing pro demo user')
  } else {
    const [inserted] = await db
      .insert(schema.users)
      .values({
        name: 'Pro Demo User',
        email: DEMO_PRO_EMAIL,
        passwordHash: proHash,
        emailVerified: new Date(),
      })
      .returning({ id: schema.users.id })
    proUserId = inserted!.id
    console.log('Created pro demo user')
  }

  // --- Pro subscription ---
  const existingSub = await db
    .select({ id: schema.subscriptions.id })
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.userId, proUserId))
    .limit(1)

  if (existingSub.length > 0) {
    await db
      .update(schema.subscriptions)
      .set({ status: 'active', currentPeriodEnd: FAR_FUTURE, cancelAtPeriodEnd: false })
      .where(eq(schema.subscriptions.userId, proUserId))
    console.log('Updated pro demo subscription')
  } else {
    await db.insert(schema.subscriptions).values({
      userId: proUserId,
      stripeCustomerId: `cus_demo_pro_${proUserId.slice(0, 8)}`,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: FAR_FUTURE,
      cancelAtPeriodEnd: false,
    })
    console.log('Created pro demo subscription')
  }

  console.log('')
  console.log('Done!')
  console.log(`  Free: ${DEMO_FREE_EMAIL} / ${DEMO_FREE_PASSWORD}`)
  console.log(`  Pro:  ${DEMO_PRO_EMAIL} / ${DEMO_PRO_PASSWORD}`)
}

seed().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
