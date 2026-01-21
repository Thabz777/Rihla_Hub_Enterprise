export default function handler(req, res) {
    if (req.method === 'POST') {
        let { email, password } = req.body || {};

        // Handle potential string body or missing parsing
        let bodyType = typeof req.body;
        if (bodyType === 'string') {
            try {
                const parsed = JSON.parse(req.body);
                email = parsed.email;
                password = parsed.password;
                bodyType = 'string-parsed';
            } catch (e) {
                bodyType = 'string-failed-parse';
            }
        }

        // Normalize
        const normalizedEmail = email ? String(email).trim().toLowerCase() : '';
        const normalizedPass = password ? String(password).trim() : '';

        // DEBUG BACKDOOR
        if (normalizedEmail === 'debug' && normalizedPass === 'debug') {
            return res.status(200).json({
                access_token: 'mock_admin_token_12345',
                user: { id: 1, full_name: 'Debug User', email: 'debug@rihla.com', role: 'admin' }
            });
        }

        // Mock Authentication Logic
        if (normalizedEmail === 'admin@rihla.com' && normalizedPass === 'admin123') {
            return res.status(200).json({
                access_token: 'mock_admin_token_12345',
                user: {
                    id: 1,
                    full_name: 'Admin User',
                    email: 'admin@rihla.com',
                    role: 'admin'
                }
            });
        } else if (normalizedEmail === 'user@rihla.com' && normalizedPass === 'user123') {
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

        // DEBUG ERROR MESSAGE
        return res.status(401).json({
            error: `INVALID: Recvd '${normalizedEmail}' / '${normalizedPass}' (Body: ${bodyType})`
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
