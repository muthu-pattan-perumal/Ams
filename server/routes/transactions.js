import express from 'express';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(auth);

router.get('/', async (req, res) => {
    const { customerId, supplierId } = req.query;
    let where = {};
    if (customerId) where.userId = customerId;
    if (supplierId) where.userId = supplierId;

    const transactions = await prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' }
    });
    res.json(transactions);
});

router.post('/', authorize('Admin'), async (req, res) => {
    const { type, amount, notes, date, userId, fileId, entityType } = req.body;
    try {
        const val = parseFloat(amount);

        // Build the transaction and the balance update query
        const queries = [
            prisma.transaction.create({
                data: {
                    type,
                    amount: val,
                    notes,
                    date: new Date(date),
                    userId,
                    entityType: entityType || 'Customer',
                    fileId
                }
            })
        ];

        // Only update the actual associated table instead of blindly trying both
        if (entityType === 'Supplier') {
            queries.push(
                prisma.supplier.updateMany({
                    where: { id: userId },
                    data: { balance: { [type === 'Pay' ? 'increment' : 'decrement']: val } }
                })
            );
        } else {
            // Default to Customer
            queries.push(
                prisma.customer.updateMany({
                    where: { id: userId },
                    data: { balance: { [type === 'Receive' ? 'increment' : 'decrement']: val } }
                })
            );
        }

        const [transaction] = await prisma.$transaction(queries);
        res.json(transaction);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Error creating transaction' });
    }
});


export default router;
