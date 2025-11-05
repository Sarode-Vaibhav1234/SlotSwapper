
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { protect } = require('./middleware/auth'); // Import protect middleware

// Load env vars
dotenv.config({ path: './.env' });

// Connect to database
connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://slotswapperproject.vercel.app',
];


app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
}));


// Body parser (to parse JSON in request body)
app.use(express.json());

// Import Routes
const auth = require('./routes/auth');
const events = require('./routes/events');
const swaps = require('./routes/swaps'); // Will contain the core swap logic

// Mount Routers
app.use('/api/v1/auth', auth);
// All event and swap routes should be protected
app.use('/api/v1/events', protect, events);
app.use('/api/v1/swaps', protect, swaps);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});