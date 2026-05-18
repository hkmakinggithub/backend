// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const dotenv = require('dotenv');

// dotenv.config();

// // Import routes
// const authRoutes = require('./routes/authRoutes');
// const categoryRoutes = require('./routes/categoryRoutes');
// const businessRoutes = require('./routes/businessRoutes');
// const favoriteRoutes = require('./routes/favoriteRoutes');
// const reviewRoutes = require('./routes/reviewRoutes');
// const notificationRoutes = require('./routes/notificationRoutes');
// const cityRoutes = require('./routes/cityRoutes');
// const adminRoutes = require('./routes/adminRoutes');

// const adminAdsRoutes = require('./routes/adminAdsRoutes');
// const app = express();

// // Middleware
// app.use(cors({
//   origin: '*',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use(helmet());
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Routes - ORDER MATTERS
// app.use('/api/auth', authRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/businesses', businessRoutes);
// app.use('/api/favorites', favoriteRoutes);
// app.use('/api/reviews', reviewRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/cities', cityRoutes);
// app.use('/api/admin', adminRoutes); // Make sure this line exists

// // Health check
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// // Root endpoint
// app.get('/', (req, res) => {
//   res.json({
//     message: 'Maru Gaam API Server',
//     version: '1.0.0',
//     endpoints: {
//       auth: '/api/auth',
//       categories: '/api/categories',
//       businesses: '/api/businesses',
//       favorites: '/api/favorites',
//       reviews: '/api/reviews',
//       notifications: '/api/notifications',
//       cities: '/api/cities',
//       admin: '/api/admin'
//     }
//   });
// });

// // 404 handler - This should be LAST
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route not found: ${req.method} ${req.url}`
//   });
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error('Error:', err.stack);
//   res.status(500).json({
//     success: false,
//     message: 'Internal server error'
//   });
// });

// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));



// app.use('/api/admin', adminAdsRoutes);
// app.use('/uploads', express.static('uploads'));
// module.exports = app;



const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const businessRoutes = require('./routes/businessRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const cityRoutes = require('./routes/cityRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminAdsRoutes = require('./routes/adminAdsRoutes'); 
const newsRoutes = require('./routes/news');

// 🟢 THE FIX: Import the export router we built earlier
const exportRouter = require('./routes/exportrouter');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/uploads', express.static('uploads'));

// ==========================================
// API ROUTES
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/news', newsRoutes); 

// Admin Routes
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminAdsRoutes); 
// 🟢 THE FIX: Mount the Excel export routes to the admin panel
app.use('/api/admin', exportRouter); 

// ==========================================
// SYSTEM ROUTES
// ==========================================

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Maru Gaam API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      categories: '/api/categories',
      businesses: '/api/businesses',
      favorites: '/api/favorites',
      reviews: '/api/reviews',
      notifications: '/api/notifications',
      cities: '/api/cities',
      admin: '/api/admin',
      news: '/api/news'
    }
  });
});

// ==========================================
// ERROR HANDLERS (Must be at the very bottom!)
// ==========================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

module.exports = app;