import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import moldRoutes from './routes/molds';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.use('/api/molds', moldRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});