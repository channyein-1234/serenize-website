import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

// You can add your API routes here

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
