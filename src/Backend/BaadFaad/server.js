/**
 * @fileoverview BaadFaad — Express Application Entry Point
 * @description Main server file that bootstraps the entire backend:
 *  1. Loads environment variables (dotenv)
 *  2. Connects to MongoDB via Mongoose
 *  3. Creates an HTTP server with Express
 *  4. Initializes Socket.IO for real-time session events
 *  5. Registers global middleware (CORS, JSON body parser)
 *  6. Mounts all API route modules under /api/*
 *  7. Starts listening on the configured PORT
 *
 * @module server
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import connectDB from './config/database.js';
import { initSocket } from './config/socket.js';

// routes
import mailRoutes from './routes/mail.routes.js';
import nudgeRoutes from './routes/nudge.route.js';
import groupRoutes from './routes/group.routes.js';
import authRoutes from './routes/authRoute.js';
import participantRoutes from './routes/participant.routes.js';
import splitRoutes from './routes/split.routes.js';
import receiptRoutes from './routes/receipt.routes.js';
import sessionRoutes from './routes/session.route.js';
import billRoutes from './routes/bill.routes.js';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envCandidates = [
  process.env.BACKEND_ENV_PATH,
  path.join(__dirname, '.env'),
  path.join(__dirname, '..', '.env'),
  path.join(__dirname, '..', '..', '.env'),
  path.join(__dirname, '..', '..', '..', '.env'),
  path.join(process.cwd(), '.env'),
].filter(Boolean);

let envLoaded = false;
for (const envPath of envCandidates) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  dotenv.config();
}

connectDB();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/nudge', nudgeRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/splits', splitRoutes);
app.use('/api/receipts', receiptRoutes);
app.use("/api/session", sessionRoutes);
app.use('/api/bills', billRoutes);

app.get('/', (req, res) => {
  res.send('Server is running!');
});

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
