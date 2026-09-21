const express = require('express');

const app = express();
const port = 5000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ message: 'FashionForge backend is running' });
});

app.listen(port, () => {
  console.log(`FashionForge backend is running on port ${port}`);
});