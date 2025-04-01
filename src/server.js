import express from 'express';
import login from './routes/login.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Settings
app.set('case sensitive routing', true);

// middlewares
app.use(express.json());

// Routes
app.use(login);

// Port
app.listen(3000);