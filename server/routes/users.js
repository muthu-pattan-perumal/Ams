import express from 'express';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Only Admin can manage users
router.use(auth, authorize('Admin'));

router.get('/', async (req, res) => {
    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
    });
    res.json(users);
});

router.post('/', async (req, res) => {
    const { name, email, phone, password, role } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: { name, email, phone, password: hashedPassword, role }
        });
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: 'User already exists or invalid data' });
    }
});

router.put('/:id', async (req, res) => {
    const { name, email, phone, password, role } = req.body;
    const data = { name, email, phone, role };

    if (password) {
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(password, salt);
    }

    try {
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data
        });
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: 'Update failed' });
    }
});

router.delete('/:id', async (req, res) => {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
});

export default router;
