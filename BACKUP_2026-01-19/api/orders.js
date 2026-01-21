export default function handler(req, res) {
    const orders = [
        { id: 1, order_number: 'ORD-001', customer_name: 'Ahmed Al-Saud', brand_name: 'Brand A', total: 1250.00, status: 'completed' },
        { id: 2, order_number: 'ORD-002', customer_name: 'Sara Khan', brand_name: 'Brand B', total: 450.50, status: 'processing' },
        { id: 3, order_number: 'ORD-003', customer_name: 'Mohammed Ali', brand_name: 'Brand A', total: 2100.00, status: 'pending' },
        { id: 4, order_number: 'ORD-004', customer_name: 'Layla Yasmin', brand_name: 'Brand C', total: 320.00, status: 'completed' },
        { id: 5, order_number: 'ORD-005', customer_name: 'Fahad Omar', brand_name: 'Brand B', total: 890.00, status: 'cancelled' },
    ];
    res.status(200).json(orders);
}
