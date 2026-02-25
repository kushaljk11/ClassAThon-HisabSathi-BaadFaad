import express from 'express'; 
import cors from 'cors'; 
import dotenv from 'dotenv'; 
import connectDB from './config/database.js';
import mailRoutes from './routes/mail.routes.js';
import nudgeRoutes from './routes/nudge.route.js';

connectDB();

dotenv.config(); 

const app = express(); 
app.use(cors()); 
app.use(express.json()); 
const PORT = process.env.PORT || 5000; 

app.use("/api/mail", mailRoutes);
app.use("/api/nudge", nudgeRoutes);

app.get('/', (req, res) => { 
res.send('Server is running!'); 
}); 

app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 
