import express from 'express';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(auth);

router.get('/', async (req, res) => {
    const customers = await prisma.customer.findMany();
    res.json(customers);
});

router.post('/', authorize('Admin'), async (req, res) => {
    const { name, phone, address, email, openingBalance } = req.body;
    try {
        const customer = await prisma.customer.create({
            data: { name, phone, address, email, openingBalance: parseFloat(openingBalance) }
        });
        res.json(customer);
    } catch (err) {
        res.status(400).json({ message: 'Error creating customer' });
    }
});

router.put('/:id', authorize('Admin'), async (req, res) => {
    const { name, phone, address, email, openingBalance } = req.body;
    try {
        const customer = await prisma.customer.update({
            where: { id: req.params.id },
            data: { name, phone, address, email, openingBalance: parseFloat(openingBalance) }
        });
        res.json(customer);
    } catch (err) {
        res.status(400).json({ message: 'Update failed' });
    }
});

router.delete('/:id', authorize('Admin'), async (req, res) => {
    await prisma.customer.delete({ where: { id: req.params.id } });
    res.json({ message: 'Customer deleted' });
});

export default router;
