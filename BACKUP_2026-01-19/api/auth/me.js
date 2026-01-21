export default function handler(req, res) {
    const authHeader = req.headers.authorization;

    // Regex to match "Bearer <token>" case-insensitive
    const match = authHeader ? authHeader.match(/^Bearer\s+(.*)$/i) : null;

    if (!match) {
        return res.status(401).json({ error: 'Unauthorized: Missing Bearer token' });
    }

    const token = match[1].trim();

    if (token === 'mock_admin_token_12345') {
        return res.status(200).json({
            id: 1,
            full_name: 'Admin User',
            email: 'admin@rihla.com',
            role: 'admin'
        });
    } else if (token === 'mock_user_token_67890') {
        return res.status(200).json({
            id: 2,
            full_name: 'Standard User',
            email: 'user@rihla.com',
            role: 'user'
        });
    }

    return res.status(401).json({ error: 'Invalid token' });
}
