const express = require('express');
const cors = require('cors');
const gtrends = require('google-trends-api');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/trends', async (req, res) => {
    const { hashtag } = req.body;

    if (!hashtag) {
        return res.status(400).json({ error: 'Missing hashtag' });
    }

    try {
        const trends = await gtrends.interestOverTime({ keyword: hashtag });
        const timelineData = trends.default.timelineData;

        if (!timelineData || timelineData.length === 0) {
            return res.json({ trendScore: 0 });
        }

        // Tính điểm trung bình 7 ngày gần nhất
        const values = timelineData.slice(-7).map(item => item.value[0]);
        const average = values.reduce((sum, val) => sum + val, 0) / values.length;

        res.json({ trendScore: Math.round(average) });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching trend data' });
    }
});

app.get('/', (req, res) => {
    res.send('Hashtag Intelligence API is running!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
