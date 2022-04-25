import { PrismaClient } from '../app/models/client';
// import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function seed() {

    console.log('Database has been seeded. 🌱');
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
