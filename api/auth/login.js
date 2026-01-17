export default function handler(req, res) {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        // Mock Authentication Logic
        if (email === 'admin@rihla.com' && password === 'admin123') {
            return res.status(200).json({
                access_token: 'mock_admin_token_12345',
                user: {
                    id: 1,
                    full_name: 'Admin User',
                    email: 'admin@rihla.com',
                    role: 'admin'
                }
            });
        } else if (email === 'user@rihla.com' && password === 'user123') {
            return res.status(200).json({
                access_token: 'mock_user_token_67890',
                user: {
                    id: 2,
                    full_name: 'Standard User',
                    email: 'user@rihla.com',
                    role: 'user'
                }
            });
        }

        return res.status(401).json({ error: 'Invalid credentials. Try admin@rihla.com / admin123' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
