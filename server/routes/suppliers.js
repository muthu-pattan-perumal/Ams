import express from 'express';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(auth);

router.get('/', async (req, res) => {
    const suppliers = await prisma.supplier.findMany();
    res.json(suppliers);
});

router.post('/', authorize('Admin'), async (req, res) => {
    const { name, phone, address, email, openingBalance } = req.body;
    try {
        const supplier = await prisma.supplier.create({
            data: { name, phone, address, email, openingBalance: parseFloat(openingBalance) }
        });
        res.json(supplier);
    } catch (err) {
        res.status(400).json({ message: 'Error creating supplier' });
    }
});

router.put('/:id', authorize('Admin'), async (req, res) => {
    const { name, phone, address, email, openingBalance } = req.body;
    try {
        const supplier = await prisma.supplier.update({
            where: { id: req.params.id },
            data: { name, phone, address, email, openingBalance: parseFloat(openingBalance) }
        });
        res.json(supplier);
    } catch (err) {
        res.status(400).json({ message: 'Update failed' });
    }
});

router.delete('/:id', authorize('Admin'), async (req, res) => {
    await prisma.supplier.delete({ where: { id: req.params.id } });
    res.json({ message: 'Supplier deleted' });
});

export default router;
