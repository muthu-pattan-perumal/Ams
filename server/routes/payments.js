import express from 'express';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(auth);

router.get('/', async (req, res) => {
    const payments = await prisma.payment.findMany({
        orderBy: { date: 'desc' }
    });
    res.json(payments);
});

router.post('/', authorize('Admin'), async (req, res) => {
    const { userId, amount, date, paymentMode, fileId, entityType } = req.body;
    try {
        const val = parseFloat(amount);

        const queries = [
            prisma.payment.create({
                data: {
                    userId,
                    entityType: entityType || 'Customer',
                    amount: val,
                    date: new Date(date),
                    paymentMode,
                    fileId
                }
            })
        ];

        if (entityType === 'Supplier') {
            queries.push(
                prisma.supplier.updateMany({
                    where: { id: userId },
                    data: { balance: { decrement: val } }
                })
            );
        } else {
            // Default to Customer
            queries.push(
                prisma.customer.updateMany({
                    where: { id: userId },
                    data: { balance: { decrement: val } }
                })
            );
        }

        const [payment] = await prisma.$transaction(queries);
        res.json(payment);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Error creating payment' });
    }
});


export default router;
