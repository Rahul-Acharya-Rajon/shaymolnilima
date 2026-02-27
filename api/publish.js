// api/publish.js
export default async function handler(req, res) {
    const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;
    const BIN_ID = process.env.JSONBIN_BIN_ID;

    // ১. ডেটা পড়ার জন্য (GET Request)
    if (req.method === 'GET') {
        try {
            const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
                headers: { 'X-Master-Key': MASTER_KEY, 'X-Bin-Meta': 'false' }
            });
            const data = await response.json();
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ error: "লোড করা সম্ভব হয়নি" });
        }
    }

    // ২. ডেটা আপলোড করার জন্য (POST Request)
    if (req.method === 'POST') {
        try {
            // বর্তমান ডাটাবেস নিয়ে আসা
            const getRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
                headers: { 'X-Master-Key': MASTER_KEY, 'X-Bin-Meta': 'false' }
            });
            let currentDB = await getRes.json();

            // নতুন ডেটা ফরম্যাট করা
            const { type, title, author, content, date } = req.body;
            const newItem = { title, author, content, date };

            if (!currentDB.stories) currentDB.stories = [];
            if (!currentDB.poems) currentDB.poems = [];

            if (type === 'story') currentDB.stories.unshift(newItem);
            else currentDB.poems.unshift(newItem);

            // JSONBin-এ সেভ করা
            const updateRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': MASTER_KEY
                },
                body: JSON.stringify(currentDB)
            });

            if (updateRes.ok) {
                return res.status(200).json({ success: true });
            } else {
                throw new Error("JSONBin আপডেট ব্যর্থ");
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}