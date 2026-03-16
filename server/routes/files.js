import express from 'express';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { auth } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(auth);

router.post('/upload', async (req, res) => {
    const { fileName, mimeType, size, base64 } = req.body;

    if (!base64) return res.status(400).json({ message: 'No file data provided' });

    try {
        const uploadedFile = await prisma.uploadedFile.create({
            data: {
                fileName: fileName || 'unknown',
                mimeType: mimeType || 'application/octet-stream',
                size: size || 0,
                base64: base64
            }
        });
        res.json({ id: uploadedFile.id });
    } catch (err) {
        console.error('File upload error:', err);
        res.status(500).json({ message: 'Upload failed' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const file = await prisma.uploadedFile.findUnique({
            where: { id: req.params.id }
        });
        if (!file) return res.status(404).json({ message: 'File not found' });
        res.json(file);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving file' });
    }
});

export default router;
