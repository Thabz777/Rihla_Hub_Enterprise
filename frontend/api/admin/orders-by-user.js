export default function handler(req, res) {
    res.status(200).json({
        "User A": { count: 12, total_value: 5400 },
        "User B": { count: 8, total_value: 3200 },
        "User C": { count: 15, total_value: 1200 }
    });
}
