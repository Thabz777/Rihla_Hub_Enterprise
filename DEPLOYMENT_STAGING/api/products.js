export default function handler(req, res) {
    if (req.method === 'GET') {
        const products = [
            { id: 1, sku: 'SKU-001', name: 'Luxury Watch', brand_name: 'Brand A', category: 'Accessories', stock: 15, price: 5000.00 },
            { id: 2, sku: 'SKU-002', name: 'Designer Bag', brand_name: 'Brand B', category: 'Fashion', stock: 5, price: 3500.00 },
            { id: 3, sku: 'SKU-003', name: 'Perfume X', brand_name: 'Brand A', category: 'Beauty', stock: 0, price: 450.00 },
            { id: 4, sku: 'SKU-004', name: 'Sneakers Pro', brand_name: 'Brand C', category: 'Footwear', stock: 25, price: 800.00 },
        ];
        return res.status(200).json(products);
    }

    if (req.method === 'POST') {
        // Return success for creation
        return res.status(201).json({ message: 'Product created successfully' });
    }

    if (req.method === 'PUT') {
        return res.status(200).json({ message: 'Product updated successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
