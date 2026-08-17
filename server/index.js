const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const DATA_FILE = path.join(__dirname, 'data', 'responses.json');

app.use(express.json());

// Serve static client
app.use('/', express.static(path.join(__dirname, '..', 'client')));

app.post('/api/submit', (req, res) => {
  const entry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    payload: req.body
  };

  // Read existing
  fs.readFile(DATA_FILE, 'utf8', (err, raw) => {
    let arr = [];
    if (!err) {
      try { arr = JSON.parse(raw || '[]'); } catch (e) { arr = []; }
    }
    arr.push(entry);
    fs.writeFile(DATA_FILE, JSON.stringify(arr, null, 2), (err) => {
      if (err) {
        console.error('Failed to write data', err);
        return res.status(500).json({ error: 'Failed to save' });
      }
      res.json({ status: 'ok', entry });
    });
  });
});

// Simple health endpoint
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
