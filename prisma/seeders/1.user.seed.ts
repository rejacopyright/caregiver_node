// npx ts-node prisma/seeders/1.user.seed.ts

import { PrismaClient } from '@prisma/client'

import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const data = [
  { username: 'john', email: 'john@mail.com' },
  { username: 'jane', email: 'jane@mail.com' },
]

async function main() {
  data?.map(async (item) => {
    await prisma.user.upsert({
      where: { email: item?.email },
      update: item,
      create: { ...item, password: await bcrypt.hash('1234', 10) },
    })
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
