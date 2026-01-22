import fetch from 'node-fetch';

const API = 'http://localhost:5000/api';
const token = 'dummy'; // replace with real token if needed

(async () => {
    try {
        const res = await fetch(`${API}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                customer_name: 'Test User',
                customer_email: 'test@example.com',
                customer_phone: '1234567890',
                brand_id: '60f5c2b5e1d2c8a5b0e5d123',
                items: [{ product_id: '60f5c2b5e1d2c8a5b0e5d456', quantity: 1 }],
                apply_vat: true,
                shipping_charges: 0,
                payment_method: 'Cash',
                status: 'pending'
            })
        });
        const data = await res.json();
        console.log('Response status:', res.status);
        console.log('Response data:', data);
    } catch (err) {
        console.error('Fetch error:', err);
    }
})();
