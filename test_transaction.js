async function test() {
    console.log('Starting test...');
    try {
        const loginRes = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'admin' })
        });

        const loginData = await loginRes.json();
        if (!loginData.token) {
            console.log('Login failed:', loginData);
            return;
        }
        const token = loginData.token;
        console.log('Login success');

        const custRes = await fetch('http://localhost:5000/api/customers', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const customers = await custRes.json();
        let customerId = customers.length > 0 ? customers[0].id : null;

        if (!customerId) {
            console.log('Creating customer...');
            const createCustRes = await fetch('http://localhost:5000/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: 'Test', phone: '123', email: 'test@test.com', address: '123', openingBalance: 0 })
            });
            const custData = await createCustRes.json();
            customerId = custData.id;
        }

        console.log('Creating transaction...');
        const transRes = await fetch('http://localhost:5000/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ type: 'Receive', amount: 100, notes: 'test', date: '2026-03-10', userId: customerId, fileId: null })
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
