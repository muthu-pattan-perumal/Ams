import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function test() {
    try {
        let customer = await prisma.customer.findFirst();
        if (!customer) {
            customer = await prisma.customer.create({
                data: { name: 'Test', phone: '123', email: 't@t.com', address: '123', openingBalance: 0 }
            });
        }

        console.log('Customer:', customer.id);

        const type = 'Receive';
        const val = 100;

        const [transaction] = await prisma.$transaction([
            prisma.transaction.create({
                data: {
                    type,
                    amount: val,
                    notes: 'test',
                    date: new Date(),
                    userId: customer.id,
                    fileId: null
                }
            }),
            prisma.customer.updateMany({
                where: { id: customer.id },
                data: { balance: { increment: val } }
            }),
            prisma.supplier.updateMany({
                where: { id: customer.id },
                data: { balance: { decrement: val } } // doesn't matter, 0 rows updated
            })
        ]);

        console.log('Transaction success:', transaction);
    } catch (err) {
        console.error('Transaction error:', err);
    } finally {
        await prisma.$disconnect();
    }
}
test();
