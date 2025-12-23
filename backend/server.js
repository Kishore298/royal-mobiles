const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const subcategoryRoutes = require('./routes/subcategory.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const notificationRoutes = require('./routes/notification.routes');

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Setup Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: [
      'https://royal-mobiles.vercel.app',
      'https://royal-mobiles-admin.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Updated CORS middleware
app.use(cors({
  origin: [
    'https://royal-mobiles.vercel.app',
    'https://royal-mobiles-user-nu.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Optional: Rate Limiting (tweak for production if needed)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000
});
app.use(limiter);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.options('*', cors()); // handle preflight

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve static files for frontend deployment (optional)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });
}

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
