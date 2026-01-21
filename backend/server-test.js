import express from 'express';
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        version: 'TEST V12',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Test Server running on port ${PORT}`);
});
