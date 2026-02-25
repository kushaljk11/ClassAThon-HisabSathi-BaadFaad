import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load env vars BEFORE anything that needs them
dotenv.config();

import connectDB from './config/database.js';
import mailRoutes from './routes/mail.routes.js';
import nudgeRoutes from './routes/nudge.route.js';
import groupRoutes from './routes/group.routes.js';
import participantRoutes from './routes/participant.routes.js';
import splitRoutes from './routes/split.routes.js';
import receiptRoutes from './routes/receipt.routes.js';
import sessionRoutes from './routes/session.route.js';

connectDB();

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

// Mount API routes
app.use('/api/participants', participantRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/nudge', nudgeRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/splits', splitRoutes);
app.use('/api/receipts', receiptRoutes);
app.use("/api/session", sessionRoutes);

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
