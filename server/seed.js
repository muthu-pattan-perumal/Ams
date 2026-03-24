import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@ams.com';
    const password = 'password123';
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        console.log(`User ${email} already exists.`);
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: email,
            phone: '1234567890',
            password: hashedPassword,
            role: 'Admin',
        },
    });
    
    console.log(`Created user: ${user.name} (${user.email}) with password: ${password}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
