// services/event-service/src/index.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { connectDB } = require('./infrastructure/db/mongoose');
const eventRoutes = require('./api/routes/events');

const app = express();
connectDB();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/events', eventRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Event Service running on port ${PORT}`);
});