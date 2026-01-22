import axios from 'axios';

const API = 'http://localhost:5000/api';
const token = 'dummy'; // replace with real token if needed

async function createOrder() {
    try {
        const response = await axios.post(`${API}/orders`, {
            customer_name: 'Test User',
            customer_email: 'test@example.com',
            customer_phone: '1234567890',
            brand_id: '60f5c2b5e1d2c8a5b0e5d123',
            items: [{ product_id: '60f5c2b5e1d2c8a5b0e5d456', quantity: 1 }],
            apply_vat: true,
            shipping_charges: 0,
            payment_method: 'Cash',
            status: 'pending'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Order created:', response.data);
    } catch (err) {
        if (err.response) {
            console.error('Error response:', err.response.data);
        } else {
            console.error('Error:', err.message);
        }
    }
}

createOrder();
