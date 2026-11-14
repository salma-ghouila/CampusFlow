import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@campus.tn' },
    update: {},
    create: {
      fullName: 'Administrateur',
      email: 'admin@campus.tn',
      passwordHash: await bcrypt.hash('Admin12345', 10),
      role: 'ADMIN',
    },
  });

  await prisma.program.upsert({
    where: { name: 'Informatique' },
    update: {},
    create: { name: 'Informatique' },
  });

  console.log('Seed terminé');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());