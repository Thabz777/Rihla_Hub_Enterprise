export default function handler(req, res) {
    // Simulate delay for realism
    setTimeout(() => {
        res.status(200).json({
            total_revenue: 1250000,
            revenue_change: 12.5,
            total_orders: 850,
            orders_change: 5.2,
            total_customers: 3200,
            total_products: 450
        });
    }, 500);
}
