import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'lumen-calculator-api' });
});

app.post('/api/calculations', (request, response) => {
  const { expression, result } = request.body;
  if (typeof expression !== 'string' || typeof result !== 'string') {
    return response.status(400).json({ error: 'expression and result are required' });
  }
  response.status(201).json({ expression, result, saved: false });
});

app.listen(port, () => console.log(`Lumen API running on http://localhost:${port}`));
