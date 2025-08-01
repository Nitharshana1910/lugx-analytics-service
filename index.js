const express = require('express');
const { createClient } = require('@clickhouse/client');

const app = express();
app.use(express.json());

// Setup ClickHouse connection
const clickhouse = createClient({
  url: 'http://clickhouse:8123',
  username: 'default',
  password: ''
});


const cors = require("cors");
app.use(cors());

// POST /track — to store analytics data
app.post('/track', async (req, res) => {
  const { eventType, url, sessionId } = req.body;

  if (!eventType || !url || !sessionId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await clickhouse.insert({
      table: 'analytics',
      format: 'JSONEachRow',
      values: [
        {
          eventType,
          url,
          sessionId,
          timestamp: new Date().toISOString().split('.')[0].replace('T', ' '),
        },
      ],
    });

    res.status(200).send('Event recorded successfully');
  } catch (err) {
    console.error('ClickHouse error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// GET /events — read back recent analytics (optional)
app.get('/events', async (req, res) => {
  try {
    const query = `
      SELECT eventType, url, sessionId, timestamp
      FROM analytics
      ORDER BY timestamp DESC
      LIMIT 50
    `;
    const resultSet = await clickhouse.query({ query, format: 'JSON' });
    const data = await resultSet.json();
    res.json(data);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).send('Failed to fetch events');
  }
});

app.listen(3003, () => {
  console.log('📊 Analytics Service running at http://localhost:3003');
});
