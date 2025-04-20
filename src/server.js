import express from 'express';
import login from './routes/login.js';
// import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
// dotenv.config();

const app = express();
process.env.TZ = 'America/Mexico_City';

// Settings
app.set('case sensitive routing', true);

// middlewares
app.use(express.json());
app.use(cookieParser());

// Routes
app.use(login);

// Port
app.listen(3000);