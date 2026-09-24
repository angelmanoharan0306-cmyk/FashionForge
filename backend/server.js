const express = require('express');
const path = require('path');

const app = express();
const port = 5000;
const frontendPath = path.join(__dirname, '..', 'frontend');

app.use(express.json());
app.use(express.static(frontendPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ message: 'FashionForge backend is running' });
});

app.listen(port, () => {
  console.log(`FashionForge backend is running on port ${port}`);
});