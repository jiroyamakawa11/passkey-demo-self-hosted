const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const passkeyRoutes = require('./routes/passkeyRoutes');
const { sessionMiddleware } = require('./middleware/session');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(sessionMiddleware);

app.use('/api', authRoutes);
app.use('/api', passkeyRoutes);

module.exports = app;
