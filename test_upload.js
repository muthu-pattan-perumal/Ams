import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function test() {
    console.log('Starting upload test...');
    try {
        const loginRes = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
        });

        const loginData = await loginRes.json();
        const token = loginData.token;

        // Fetch customers
        const custRes = await fetch('http://localhost:5000/api/customers', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const customers = await custRes.json();
        let customerId = customers.length > 0 ? customers[0].id : null;

        if (!customerId) {
            console.log('No customers found');
            return;
        }

        console.log('Uploading file...');
        fs.writeFileSync('test.txt', 'hello world');
        const form = new FormData();
        form.append('file', fs.createReadStream('test.txt'));

        const uploadRes = await fetch('http://localhost:5000/api/files/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }, // node-fetch formData needs no content-type!
            body: form
        });

        if (!uploadRes.ok) {
            console.error('Upload failed:', uploadRes.status, await uploadRes.text());
            return;
        }
        const fileData = await uploadRes.json();
        console.log('Uploaded File:', fileData);

        console.log('Creating transaction...');
        const transRes = await fetch('http://localhost:5000/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ type: 'Receive', amount: 100, notes: 'test', date: '2026-03-10', userId: customerId, fileId: fileData.id, file: {} })
        });

        if (!transRes.ok) {
            console.error('Transaction Failed:', transRes.status, await transRes.text());
            return;
        }
        const transData = await transRes.json();
        console.log('Transaction Success:', transData);
    } catch (e) {
        console.error(e);
    }
}

test();
