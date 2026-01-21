export default function handler(req, res) {
    res.status(200).json([
        { id: '1', name: 'Brand A' },
        { id: '2', name: 'Brand B' },
        { id: '3', name: 'Brand C' }
    ]);
}
